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

io.on("connection", (socket) => {
  console.log("New client connected");

  //getsRooms
  socket.on("getRooms", () => {
    Room.find({}).then((data) => {
      // console.log(data);
      socket.emit("getsRooms", data);
    });
  });

  socket.on("joinRoom", ({ roomId }) => {
    console.log(roomId);
    socket.join(roomId);

    Room.findById(roomId).then((data) => {
      console.log(data);
      io.to(roomId).emit("getRoom", data);
    });
  });
  socket.on("ready", (roomId, player, key) => {
    console.log(player);
    socket.to(roomId).emit("ready", player, key);
  });

  // socket.on("getRoom", ({ roomId }) => {
  //   Room.findById(roomId).then((data) => {
  //     socket.emit("getRoom", data);
  //   });
  // });

  socket.on("enterPlayer", ({ roomId, roomPassword, player2_Id, handle }) => {
    Room.findById(roomId).then((data) => {
      if (data.password == roomPassword || !data.password) {
        // console.log(data);
        if (data.player2.toObject() == null) {
          Room.findByIdAndUpdate(roomId, {
            player2: {
              _id: player2_Id,
              handle: handle,
            },
            status: "준비중",
          }).then((data) => {
            Room.find().then((data) => {
              io.emit("getsRooms", data);
              socket.emit("enterRoomId", roomId);
            });
          });
        }
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

          // console.log(newRoomData);

          // 새로운 게임 데이터 생성
          Room.create(newRoomData)
            .then((room) => {
              // 게임 데이터 생성 완료 후 방 정보를 반환
              // socket.join(room._id);
              Room.find({}).then((data) => {
                io.emit("getsRooms", data);
              });
              console.log(room);
              socket.emit("getRoomId", room._id);
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
  socket.on("sendGameInfo", ({ roomId, state }) => {
    Room.findByIdAndUpdate(roomId, { status: "게임중" }).then(() => {
      Room.find().then((data) => {
        io.emit("getsRooms", data);
      });
    });
    io.to(roomId).emit("receiveGameInfo", state);
  });

  // updatedCard: 카드가 업데이트 될 때마다
  socket.on("updatedCard", (data) => {
    // roomId로 된 room 애들에게 나를 제외한 모든 소켓에 보내는거
    const { updatedCards, roomId } = data;
    console.log(updatedCards);
    // 이 소켓 이외의 모든 room 내의 클라이언트에게 전송
    // socket.broadCast.to(roomId).emit("updatedCard", updatedCard);
    socket.in(roomId).emit("updatedCard", updatedCards);
  });
  // finishGame: 게임 이후
  socket.on("finishGame", (data) => {
    // roomId로 된 room 애들에게 나를 제외한 모든 소켓에 보내는거
    const { winner, roomId } = data;
    // 이 소켓 이외의 모든 room 내의 클라이언트에게 전송
    io.sockets.in(roomId).emit("finishGame", winner);
  });
  // exitGame: 게임 중에 유저 나갈 경우
  socket.on("exitGame", (data) => {
    const roomId = data;
    // 나가기 버튼 누른애 room 나가기
    socket.leave(roomId);
    io.to(roomId).emit("exitGame", roomId); //TODO 얘도 undefined read 뜸
  });
  // leaveGame: 상대가 나갈 경우
  socket.on("leaveGame", (data) => {
    const roomId = data;
    // 남아있는 애 room 나가기
    socket.leave(roomId);
  });

  // 클라이언트가 방 나가기 요청을 보낼 때
  socket.on("leaveRoom", (roomIndex) => {});

  // 클라이언트가 연결을 끊을 때
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("send_ready_data", (data) => {
    // console.log(data);
    io.to(data.roomId).emit("receive_ready_data", data);
  });

  // 클라이언트가 방 나가기 요청을 보낼 때
  socket.on("sendLeavePlayer1", ({ roomId, player }) => {
    Room.findByIdAndDelete(roomId).then(() => {
      Room.find().then((data) => {
        io.emit("getsRooms", data);
      });
    });
    io.to(roomId).emit("receiveLeavePlayer1", player);
    socket.leave(roomId);
  });

  socket.on("sendLeavePlayer2", ({ roomId, player }) => {
    Room.findByIdAndUpdate(roomId, { player2: null, status: "대기중" }).then(
      () => {
        Room.findById(roomId).then((data) => {
          io.to(roomId).emit("getRoom", data);
        });
        Room.find().then((data) => {
          io.emit("getsRooms", data);
        });
      }
    );

    io.to(roomId).emit("receiveLeavePlayer2", player);
    socket.leave(roomId);
  });

  socket.on("sendChangeAlgo", ({ roomId, level, algorithm }) => {
    Room.findByIdAndUpdate(roomId, { level: level, algorithm: algorithm }).then(
      () => {
        Room.find({}).then((data) => {
          io.emit("getsRooms", data);
        });
        io.to(roomId).emit("receiveChangeAlgo", roomId);
      }
    );
  });
});
////

module.exports = io;
