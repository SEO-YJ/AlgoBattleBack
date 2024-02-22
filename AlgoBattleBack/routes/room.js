var express = require("express");
var router = express.Router();
let Room = require("../model/Room");
let User = require("../model/User");

router.post("/:player1_id", function (req, res, next) {
  // 세션에서 가져온 방장의 MongoDB ID
  const player1_id = req.params.player1_id;

  // 요청 바디에서 필요한 값을 가져옴
  const { name, password, level, algorithm } = req.body;

  // 방장의 MongoDB ID를 사용하여 사용자 정보를 조회
  User.findById(player1_id)
    .then((user) => {
      // 사용자가 없을 경우 null로 응답
      if (!user) {
        console.log("사용자 정보가 없습니다.");
        res.json(null);
        return;
      }

      // 사용자 정보 객체 생성
      const player1Data = {
        _id: user._id,
        handle: user.handle,
      };

      // 요청 바디에서 가져온 값 또는 기본값 설정
      const newRoomData = {
        name: name,
        password: password !== undefined ? password : null,
        level: level,
        algorithm: algorithm,
        status: "게임전",
        player1: player1Data, // 방장의 사용자 정보 객체를 저장
        player2: null,
      };

      // 새로운 게임 데이터 생성
      Room.create(newRoomData)
        .then((room) => {
          // 게임 데이터 생성 완료 후 방 정보를 반환
          res.json(room);
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
