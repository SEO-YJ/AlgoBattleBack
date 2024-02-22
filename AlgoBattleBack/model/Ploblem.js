const mongoose = require("mongoose");
const PloblemSchema = new mongoose.Schema({
  ploblem: String,
  ploblemId: Number,
  level: Number,
  aliases: [{ type: String }],
});

const Ploblem = mongoose.model("ploblem", PloblemSchema);

module.exports = Ploblem;
