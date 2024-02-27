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

  // 클라이언트가 방 나가기 요청을 보낼 때
  socket.on("sendLeavePlayer1", ({ roomId }) => {
    Room.findByIdAndDelete(roomId).then(() => {
      Room.find().then((data) => {
        io.emit("getsRooms", data);
      });
    });
    io.to(roomId).to("receiveLeavePlayer1", roomId);
    socket.leave(roomId);
  });

  socket.on("sendLeavePlayer2", ({ roomId }) => {
    Room.findByIdAndUpdate(roomId, { status: "대기중" }).then(() => {
      Room.find().then((data) => {
        io.emit("getsRooms", data);
      });
    });
    io.to(roomId).to("receiveLeavePlayer2", roomId);
    socket.leave(roomId);
  });

  // 클라이언트가 연결을 끊을 때
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("send_ready_data", (data) => {
    // console.log(data);
    io.to(data.roomId).emit("receive_ready_data", data);
  });
});
////

module.exports = io;
