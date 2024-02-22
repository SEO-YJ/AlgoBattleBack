var express = require("express");
var router = express.Router();
const Ploblem = require("../model/Ploblem");
const Math = require("math");
/* GET users listing. */

//유저 정보 body에 user1, user2 닉네임 적어서 보내주면 푼 문제 걸러주고 랜덤으로 문제 보내줌~
//만약 알고리즘 분류를 넣을 시 aliases를 쿼리에 넣어주세요 ex) /:level?aliase=
router.get("/:level?", function (req, res, next) {
  const user1 = req.body.user1;
  const user2 = req.body.user2;
  Ploblem.find({ level: req.params.level }).then((data) => {
    const ploblems = data.filter((e) => {
      //key : 유저가 푼 문제들과 겹치는 문제 제거
      var key = 1;
      //key2 : 알고리즘 선택한 문제만 출제
      var key2 = 0;
      //   console.log(e);
      User.findOne({ handle: user1 }).then((userdata) => {
        for (i in userdata.solvedProblemsList) {
          if (userdata.solvedProblemsList[i] === e.ploblemId) {
            key = 0;
          }
        }
      });

      User.findOne({ handle: user1 }).then((userdata) => {
        for (i in userdata.solvedProblemsList) {
          if (userdata.solvedProblemsList[i] === e.ploblemId) {
            key = 0;
          }
        }
      });

      if (req.query.aliase) {
        for (aliase in e.aliases) {
          if (req.query.aliase === e.aliases[aliase]) {
            key2 = 1;
          }
        }
      }

      if (key === 1 && (key2 === 1 || !req.query.aliase)) {
        return true;
      } else {
        return false;
      }
      // console.log(ploblems);
    });
    setTimeout(() => {
      //   console.log(ploblems);
    }, 1000);

    const index = Math.floor(Math.random() * ploblems.length);
    res.json(ploblems[index]);
  });
});

module.exports = router;
