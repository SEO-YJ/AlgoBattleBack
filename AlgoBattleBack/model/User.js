const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  handle: {
    type: String,
    required: true,
  },
  tier: {
    type: Number,
    required: true,
  },
  solvedCount: {
    type: Number,
    required: true,
  },
  winCount: {
    type: Number,
    default: 0,
  },
  loseCount: {
    type: Number,
    default: 0,
  },
  solvedProblemsList: {
    type: [],
    required: true,
  },
});

// 2. 스키마 형식에 맞는 컬렉션 생성
const User = mongoose.model("User", userSchema);
module.exports = User;
