const { Server } = require("socket.io");
const Room = require("./model/Room");
const User = require("./model/User");
const { disconnect } = require("mongoose");
const io = new Server({
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// 방 목록
let gameRooms = [];

// 클라이언트에게 방 목록 전송
// function sendGameRooms() {
//   io.emit("gameRooms", gameRooms);
// }

// 새로운 게임 방 생성
function createGameRoom(
  roomName,
  roomPassword,
  roomLevel,
  roomAlgorithm,
  player1Id
) {
  const newRoom = {
    name: roomName,
    password: roomPassword,
    level: roomLevel,
    algorithm: roomAlgorithm,
    player1: player1Id,
    player2: null,
  };
  gameRooms.push(newRoom);
  // sendGameRooms();
  io.emit("gameRooms", gameRooms);
}

// 게임 방 삭제
function deleteGameRoom(roomIndex) {
  gameRooms.splice(roomIndex, 1);
  // sendGameRooms();
  io.emit("gameRooms", gameRooms);
}

io.on("connection", (socket) => {
  console.log("New client connected");
  
  socket.on("getRooms", () => {
    Room.find({}).then((data) => {
      // console.log(data);
      socket.emit("getsRooms", data);
    });
  });

  socket.on("joinRoom", ({ roomId, roomPassword, player2_Id }) => {
    Room.findById(roomId).then((data) => {
      if (data.password == roomPassword || !data.password) {
        Room.findById(roomId)
          .then((data) => {
            if (!data.player2) {
              Room.findByIdAndUpdate(roomId, { player2: player2_Id }).then(
                (data) => {
                  io.emit("gameRoom", data);
                  Room.find().then((data) => {
                    io.emit("gameRooms", data);
                  });
                }
              );
              socket.join(roomId);
              io.to(roomId).emit(data._id);
            } else {
              io.emit("gameRoom", "방이 꽉찼습니다.");
            }
            //방 업데이트 정보 보내기
          })
          .catch((err) => {
            console.log(err);
            io.emit("gameRoom", err);
          });
        socket.emit("joinRoomreply", "방입장성공");
      } else {
        console.log("비밀번호 불일치");
        socket.emit("joinRoomreply", "비밀번호 불일치");
      }
    });
  });

  // socket.on("outRoom1", { room });
  // socket.on("outRoom1", { room });
  socket.on("outRoom2", ({ roomId, player2Id }) => {
    Room.findOneAndUpdate({ _id: roomId }, { player2: null })
      .then((data) => {
        socket.on("disconnected", () => {
          console.log("2 방 나가기 성공");
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
  // 클라이언트가 방 생성 요청을 보낼 때

  socket.on(
    "createRoom",
    ({ player1_id, name, password, level, algorithm }) => {
      // console.log(player1_id);
      User.findById(player1_id)
        .then((user) => {
          // 사용자가 없을 경우 null로 응답
          if (!user) {
            console.log("사용자 정보가 없습니다.");
            res.send("사용자 정보가 없습니다.");
            return;
          }
          // 사용자 정보 객체 생성
          const player1Data = {
            _id: user._id,
            handle: user.handle,
          };
          ``;

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

          console.log(newRoomData);

          // 새로운 게임 데이터 생성
          Room.create(newRoomData)
            .then((room) => {
              // 게임 데이터 생성 완료 후 방 정보를 반환
              socket.join(room._id);
              // res.json(room);
              Room.find({}).then((data) => {
                io.emit("getsRooms", data);
              });
              console.log(room);
              socket.emit("getRoomId", room._id)
            })
            .catch((err) => {
              next(err);
            });
        })
        .catch((err) => {
          next(err);
        });
    }

    // socket.on("joinRoom")
  );

  // 클라이언트가 방 나가기 요청을 보낼 때
  socket.on("leaveRoom", (roomIndex) => {
    deleteGameRoom(roomIndex);
  });

  // 클라이언트가 연결을 끊을 때
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  // 처음 연결되었을 때 방 목록 전송
  io.emit("gameRooms", gameRooms);
});
////

module.exports = io;

// user가 방에 들어갈 경우
function joinRoom(roomId, playerId) {
  const user_id = playerId;
  Room.findById(roomId)
    .then((data) => {
      if (!data.player2) {
        Room.findByIdAndUpdate(roomId, { player2: user_id }).then((data) => {
          io.emit("gameRoom", data);
          Room.find().then((data) => {
            io.emit("gameRooms", data);
          });
        });
      } else {
        io.emit("gameRoom", "방이 꽉찼습니다.");
      }
      //방 업데이트 정보 보내기
    })
    .catch((err) => {
      console.log(err);
      io.emit("gameRoom", err);
    });
}

//user1이 방에서 나갈경우
function outRoom1(roobName) {
  Room.findOneAndUpdate({ name: roomName }, { status: "방종료" })
    .then((data) => {
      io.emit("gameRoom", data);
    })
    .catch((err) => {
      console.log(err);
      io.emit("gameRoom", err);
    });
}

//user2가 방에서 나갈경우
function outRoom2(roomName, userId) {
  Room.findOneAndUpdate({ name: roomName }, { player2: null })
    .then((data) => {})
    .catch((err) => {
      console.log(err);
    });
}
//룸 정보 다 보내기
function getRooms() {
  Room.find()
    .then((data) => {
      //룸 정보다 보내기
      io.emit("gameRomms");
    })
    .catch((err) => {
      console.log(err);
      io.emit("gameRoom", err);
    });
}

//
function getRoom(roomName) {
  Room.findOne({ name: roomName })
    .then((data) => {
      //룸 정보 보내기
      io.emit("gameRoom", data);
    })
    .catch((err) => {
      console.log(err);
      io.emit("gameRoom", err);
    });
}
