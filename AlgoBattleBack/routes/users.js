var express = require("express");
var router = express.Router();
let User = require("../model/User");

/* POST: 백준 유저 정보 생성 */
// router.post("/:userid", function (req, res, next) {
//   getSolvedacUserData(req.params.userid).then((user) => {
//     User.create({
//       handle: user.handle,
//       tier: user.tier,
//       solvedCount: user.solvedCount,
//     })
//       .then((user) => {
//         res.json(user);
//       })
//       .catch((err) => {
//         next(err);
//       });
//   });
// });

/* POST: 백준 유저 정보 생성 또는 업데이트 */
router.post("/:userid", function (req, res, next) {
  // getSolvedacUserData 함수는 해당 userid의 사용자 정보를 반환하는 함수로 가정합니다.
  getSolvedacUserData(req.params.userid).then((user) => {
    // 사용자가 없을 경우 null로 응답
    if (!user) {
      // 사용자 정보가 없을 경우 null을 응답
      console.log("사용자 정보가 없습니다.");
      res.json(null);
      return;
    }

    // 사용자 정보 객체 생성
    const userData = {
      handle: user.handle,
      tier: user.tier,
      solvedCount: user.solvedCount,
    };

    // 해당 userid로 이미 데이터가 존재하는지 확인
    User.findOne({ handle: req.params.userid }).then((existingUser) => {
      if (existingUser) {
        // 이미 데이터가 존재한다면 업데이트
        User.findOneAndUpdate(
          { handle: req.params.userid },
          userData,
          { new: true } // 업데이트된 데이터를 반환하도록 설정
        )
          .then((updatedUser) => {
            console.log("사용자 정보 업데이트");
            res.json(updatedUser); // 업데이트된 사용자 정보 반환
          })
          .catch((err) => {
            next(err); // 오류 발생 시 다음 미들웨어에 전달
          });
      } else {
        // 데이터가 존재하지 않는다면 새로 생성
        User.create(userData)
          .then((newUser) => {
            console.log("사용자 새로 생성");
            res.json(newUser); // 새로 생성된 사용자 정보 반환
          })
          .catch((err) => {
            next(err); // 오류 발생 시 다음 미들웨어에 전달
          });
      }
    });
  });
});

module.exports = router;

// Solved AC -> User 데이터 가져오기
// async function getSolvedacUserData(USER_ID) {
//   let response = await fetch(
//     `https://api-py.vercel.app/?r=https://solved.ac/api/v3/user/show?handle=${USER_ID}`,
//     {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     }
//   );

//   let data = await response.json();
//   console.log(data);
//   return data;
// }

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
    console.log(data);

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
