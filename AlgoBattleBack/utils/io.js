module.exports = function (io) {
  io.on("connection", async (socket) => {
    console.log("adsfasf", socket.id);
  });
};
