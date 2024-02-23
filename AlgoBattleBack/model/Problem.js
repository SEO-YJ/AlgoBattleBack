const mongoose = require("mongoose");
const ProblemSchema = new mongoose.Schema({
  problem: String,
  problemId: Number,
  ploblemId: Number,
  level: Number,
  aliases: [{ type: String }],
});

const Problem = mongoose.model("ploblem", ProblemSchema);

module.exports = Problem;
