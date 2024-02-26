var express = require("express");
var router = express.Router();
let User = require("../model/User");
const cheerio = require("cheerio");
const axios = require("axios");

/* GET: 유저 승수 랭킹 조회 */
/* GET: 유저 랭킹 조회 */
router.get("/ranking", (req, res, next) => {
  User.find() // 모든 사용자 가져오기
    .sort({ winCount: -1 }) // winCount 기준으로 내림차순 정렬
    .then((users) => {
      if (!users || users.length === 0) {
        return res.status(404).json({ error: "No users found" });
      }
      res.json(users);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

router.get("/ranking", (req, res, next) => {
  User.find() // 모든 사용자 가져오기
    .then((users) => {
      if (!users || users.length === 0) {
        return res.status(404).json({ error: "No users found" });
      }

      // 각 사용자의 승률 계산
      users.forEach((user) => {
        user.winRate = user.winCount / (user.winCount + user.loseCount);
      });

      // 승률 기준으로 내림차순 정렬
      users.sort((a, b) => b.winRate - a.winRate);

      res.json(users);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});


/* GET: 백준 유저 정보 조회 */
router.get("/:userid", (req, res, next) => {
  const { userid } = req.params;
  User.findOne({ handle: userid }) // 이메일 주소로 검색
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

/* POST: 백준 유저 정보 생성 또는 업데이트 */
router.post("/:userid", async function (req, res, next) {
  try {
    const user = await Promise.all([
      getSolvedacUserData(req.params.userid),
      getUserSolvedProblems(req.params.userid),
    ]);
    // 유저 정보와 맞은 문제들 잘 가져왔나 찍어봄
    console.log(user);
    const [userInfo, solvedProblemsList] = user;

    // 사용자가 없을 경우 null로 응답
    if (!userInfo || !solvedProblemsList) {
      console.log("사용자 정보 또는 푼 문제 정보가 없습니다.");
      res.json(null);
      return;
    }

    // 사용자 새로 생성할 경우
    const newUserData = {
      handle: userInfo.handle,
      tier: userInfo.tier,
      solvedCount: userInfo.solvedCount,
      solvedProblemsList,
      winCount: 0,
      loseCount: 0,
    };

    // 사용자 업데이트 할 경우
    const userData = {
      handle: userInfo.handle,
      tier: userInfo.tier,
      solvedCount: userInfo.solvedCount,
      solvedProblemsList,
    };

    // 해당 userid로 이미 데이터가 존재하는지 확인
    const existingUser = await User.findOne({ handle: req.params.userid });
    console.log(existingUser);
    if (existingUser) {
      // 이미 데이터가 존재한다면 업데이트
      const updatedUser = await User.findOneAndUpdate(
        { handle: req.params.userid },
        userData,
        { new: true }
      );
      console.log("사용자 정보 업데이트");
      res.json(updatedUser);
    } else {
      // 데이터가 존재하지 않는다면 새로 생성
      const newUser = await User.create(newUserData);
      console.log("사용자 새로 생성");
      res.json(newUser);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;

// Solved AC -> User 데이터 가져오기
async function getSolvedacUserData(USER_ID) {
  try {
    let response = await fetch(
      `https://api-py.vercel.app/?r=https://solved.ac/api/v3/user/show?handle=${USER_ID}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let data = await response.json();

    // 만약 사용자 정보가 없을 경우 에러를 throw하여 잡습니다.
    if (response.status === 404 || !data || data.error) {
      throw new Error("User not found");
    }
    return data;
  } catch (error) {
    // 에러를 콘솔에 출력하고 호출자에게 반환합니다.
    console.error("Error fetching user data:", error.message);
    // throw error;
    return null;
  }
}

// 백준 맞은 문제들 가져오기
async function getUserSolvedProblems(USER_ID) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  };
  try {
    const response = await axios.get(
      `https://www.acmicpc.net/user/${USER_ID}`,
      { headers }
    );
    const $ = cheerio.load(response.data);
    const result = $("div.problem-list a")
      .map((i, elem) => {
        const problemNumber = $(elem).text();
        return problemNumber;
      })
      .get();
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

//// 이전 콜백으로 작성하여
//// 두 함수가 데이터를 가져오기 전에 에러 발생
//// Promise - await로 해결
// router.post("/:userid", function (req, res, next) {
//   // getSolvedacUserData 함수는 해당 userid의 사용자 정보를 반환하는 함수로 가정합니다.
//   getSolvedacUserData(req.params.userid)
//     .then((user) => {
//       // 사용자가 없을 경우 null로 응답
//       if (!user) {
//         // 사용자 정보가 없을 경우 null을 응답
//         console.log("사용자 정보가 없습니다.");
//         res.json(null);
//         return;
//       }
//       return user;
//     })
//     .then((user) => {
//       getUserSolvedProblems(req.params.userid)
//         .then((solvedProblemsList) => {
//           if (!solvedProblemsList) {
//             // 사용자가 푼 문제 정보 없을 경우 null을 응답
//             console.log("사용자가 푼 문제 정보가 없습니다.");
//             res.json(null);
//             return;
//           }
//           // 사용자 정보 객체 생성
//           const userData = {
//             handle: user.handle,
//             tier: user.tier,
//             solvedCount: user.solvedCount,
//             solvedProblemsList,
//           };
//           return userData;
//         })
//         .then((userData) => {
//           // 해당 userid로 이미 데이터가 존재하는지 확인
//           User.findOne({ handle: req.params.userid }).then((existingUser) => {
//             if (existingUser) {
//               // 이미 데이터가 존재한다면 업데이트
//               User.findOneAndUpdate(
//                 { handle: req.params.userid },
//                 userData,
//                 { new: true } // 업데이트된 데이터를 반환하도록 설정
//               )
//                 .then((updatedUser) => {
//                   console.log("사용자 정보 업데이트");
//                   res.json(updatedUser); // 업데이트된 사용자 정보 반환
//                 })
//                 .catch((err) => {
//                   next(err); // 오류 발생 시 다음 미들웨어에 전달
//                 });
//             } else {
//               // 데이터가 존재하지 않는다면 새로 생성
//               User.create(userData)
//                 .then((newUser) => {
//                   console.log("사용자 새로 생성");
//                   res.json(newUser); // 새로 생성된 사용자 정보 반환
//                 })
//                 .catch((err) => {
//                   next(err); // 오류 발생 시 다음 미들웨어에 전달
//                 });
//             }
//           });
//         });
//     });
// });
