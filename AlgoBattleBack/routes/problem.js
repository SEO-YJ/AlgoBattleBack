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
  const user1 = req.body.user1;
  const user2 = req.body.user2;

  var key3 = await Promise.all([getKey(user1), getKey(user2)]);
  // console.log(req.params.level);
  Problem.find({ level: req.params.level }).then(async (data) => {
    // console.log(data);
    const problem2 = [];
    const problems = await data.filter(async (e) => {
      //key : 유저가 푼 문제들과 겹치는 문제 제거
      var key = 1;
      //key2 : 알고리즘 선택한 문제만 출제
      var key2 = 0;
      //   console.log(e);

      key3[0].solvedProblemsList.map((data) => {
        if (e.ploblemId == data) {
          console.log(data);
          key = 0;
        }
      });
      key3[1].solvedProblemsList.map((data) => {
        if (e.ploblemId == data) {
          console.log(data);
          key = 0;
        }
      });
      if (req.query.aliase) {
        for (aliase in e.aliases) {
          if (req.query.aliase === e.aliases[aliase]) {
            key2 = 1;
          }
        }
      }
      console.log(key);
      console.log(key === 1 && (key2 === 1 || !req.query.aliase));
      // return key === 1 && (key2 === 1 || !req.query.aliase);
      if (key === 1 && (key2 === 1 || !req.query.aliase)) {
        problem2.push(data);
        return true;
      } else {
        return false;
      }
    });

    console.log(problem2.length);
    const index = Math.floor(Math.random() * problem2.length);
    console.log(problem2[0][index]);
    res.json(problem2[0][index]);
  });
});

module.exports = router;
