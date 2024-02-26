const { Server } = require("socket.io");
const Room = require("./model/Room");
const io = new Server({
  cors: {
    origin: "http://localhost:3001",
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

  // 클라이언트가 방 생성 요청을 보낼 때
  socket.on(
    "createRoom",
    ({ roomName, roomPassword, roomLevel, roomAlgorithm, player1Id }) => {
      createGameRoom(
        roomName,
        roomPassword,
        roomLevel,
        roomAlgorithm,
        player1Id
      );
      console.log(gameRooms);
    }
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
function goRoom(roomName, userId) {
  User.find({ handle: userId })
    .then((data) => {
      const user_id = data._id;
      Room.findOne({ name: roomName }).then((data) => {
        if (!data.player2) {
          Room.findOneAndUpdate({ name: roomName }, { player2: user_id }).then(
            (data) => {
              io.emit("gameRoom", data);
            }
          );
        } else {
          io.emit("gameRoom", "방이 꽉찼습니다.");
        }
        //방 업데이트 정보 보내기
      });
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
    .then((data) => {
      io.emit("gameRoom", data);
    })
    .catch((err) => {
      console.log(err);
      io.emit("gameRoom", err);
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
