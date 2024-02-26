require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");

var createError = require("http-errors");

var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
// NOTE: Express와 socket.io 서버 준비 - module import
var express = require("express");
var http = require("http");
// const socketIo = require("socket.io");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var roomRouter = require("./routes/room");
const MONGO_HOST = process.env.MONGO_HOST;
mongoose
  .connect(MONGO_HOST, {
    retryWrites: true,
    w: "majority",
  })
  .then(() => {
    console.log("Connected Successful");
  })
  .catch((err) => console.log(err));

//NOTE: Socket.io 서비스 시작
// 1. HTTP 모듈이나 express를 이용하여 HTTP 서버를 준비
// 여기서는 express로 HTTP 서버 생성
var app = express();
// 2. HTTP 서버를 만들고 서버에 request 핸들러로 express 객체를 만들어서 사용
var server = http.createServer(app);
// 3. HTTP 서버의 포트를 8080으로 열어둠
server.listen(3000);
// 4. socket.io 서버 준비
// http 서버를 핸들러로 전달

// server-side
// 1. origin: 클라이언트의 주소
// 2. GET, POST 요청
// socket 서버는 4000 사용
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});
//socket.io 모듈의 v3 부터 cors 오류로 인해 설정해줘야함
// Q. origin을 도메인으로 사서 박으면 이 도메인으로 들어올 경우 허용해주는 건가?

// 5. 클라이언트에게 접속 요청이 오면 connection 이벤트가 발생
//    5.1 io.on( .. ) : 메시지를 수신하는 리스너 등록
//    5.2 io.on("connection", function(data){})
//        "connection": 이벤트 이름
//        function(data): 이벤트 핸들러
//    아래 함수는 "connection" 이라는 이벤트가 클라이언트로 부터 전송되면 data를 제어
//    그 후, "init"이라는 이벤트로 위에서 받은 socket을 리스너로 등록한 후, init 이벤트를 받으면 전달받은 데이터를 출력
io.on("connection", (socket) => {
  console.log("connection");
  socket.on("init", (payload) => {
    console.log(payload);
  });
});

// const httpServer = http.createServer(app);
// server-side
// 1. origin: 클라이언트의 주소
// 2. GET, POST 요청
// const io = require("socket.io")(httpServer, {
//   cors: {
//     origin: "http://localhost:3001",
//     methods: ["GET", "POST"],
//   },
// });

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

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/room", roomRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// socket 서버 시작
// httpServer.listen(4000, () => {
//   console.log(`Server listening on port 4000`);
// });

// const PORT = process.env.PORT || 4000;
// server.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });

module.exports = app;
