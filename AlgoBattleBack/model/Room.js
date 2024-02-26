const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    level: {
      type: Number,
      required: true,
    },
    algorithm: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      require: true,
      default: "게임전",
    },
    player1: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      handle: {
        type: String,
        required: true,
      },
    },
    player2: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // required: true,
      },
      handle: {
        type: String,
        // required: true,
      },
    },
  },
  { timestamps: true }
);

// 2. 스키마 형식에 맞는 컬렉션 생성
const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
