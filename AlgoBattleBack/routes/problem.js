var express = require("express");
var router = express.Router();
const Problem = require("../model/Problem");
const User = require("../model/User");
const Math = require("math");
/* GET users listing. */

async function getKey(userid) {
  const key = await User.findOne({ handle: userid });
  // .then((userdata) => {
  //   for (i in userdata.solvedProblemsList) {
  //     if (userdata.solvedProblemsList[i] === problemid) {
  //       key = 0;
  //     }
  //   }
  // });
  // console.log(key);
  return key;
}

//유저 정보 body에 user1, user2 닉네임 적어서 보내주면 푼 문제 걸러주고 랜덤으로 문제 보내줌~
//만약 알고리즘 분류를 넣을 시 aliases를 쿼리에 넣어주세요 ex) /:level?aliase=
router.get("/:level?", async function (req, res, next) {
  try {
    const user1 = req.query.body.user1;
    const user2 = req.query.body.user2;

    console.log(req.query.body);
    console.log(req.query);
    // console.log(req.query.eliase);
    // console.log(user1);
    if (user1 && user2) {
      key3 = await Promise.all([getKey(user1), getKey(user2)]);
    }
    console.log(req.params.level);
    Problem.find({ level: req.params.level }).then(async (data) => {
      // console.log(data);
      const problem2 = [];
      const problems = await data.filter(async (e) => {
        //key : 유저가 푼 문제들과 겹치는 문제 제거
        var key = 1;
        //key2 : 알고리즘 선택한 문제만 출제
        var key2 = 0;
        // console.log(key3);
        //   console.log(e);
        if (user1 && user2) {
          key3[0].solvedProblemsList.map((data) => {
            if (e.ploblemId == data) {
              // console.log(data);
              key = 0;
            }
          });
          key3[1].solvedProblemsList.map((data) => {
            if (e.ploblemId == data) {
              // console.log(data);
              key = 0;
            }
          });
        }
        // console.log(typeof req.query.eliase);
        // if()
        console.log(typeof req.query.aliase);
        if (typeof req.query.aliase === "string") {
          console.log(e.aliases);
          for (aliase in e.aliases) {
            console.log(e.aliases[aliase]);
            if (req.query.aliase === e.aliases[aliase]) {
              key2 = 1;
            }
          }
        }
        // console.log(key2);
        // console.log(key === 1 && (key2 === 0 || !req.query.eliase));
        // return key === 1 && (key2 === 1 || !req.query.aliase);
        if (key === 1 && (key2 === 1 || typeof req.query.aliase != "string")) {
          problem2.push(e);
          return true;
        } else {
          return false;
        }
      });

      console.log("problem2 : ", problem2);
      const index = Math.floor(Math.random() * problem2.length);
      console.log(index);
      if (problem2.length != 0) res.json(problem2[index]);
      else res.send("문제 없음");
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

module.exports = router;
