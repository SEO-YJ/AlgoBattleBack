const { Server } = require("socket.io");

const io = new Server({
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// 방 목록
let gameRooms = [];

// 클라이언트에게 방 목록 전송
function sendGameRooms() {
  io.emit("gameRooms", gameRooms);
}

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
  sendGameRooms();
}

// 게임 방 삭제
function deleteGameRoom(roomIndex) {
  gameRooms.splice(roomIndex, 1);
  sendGameRooms();
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
  sendGameRooms();
});
////

module.exports = io;
