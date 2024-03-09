const sockectio = require("socket.io");
const Request = require("../model/request-model");

function setupWebSocket(server) {
  const io = sockectio(server, { cors: { origin: "http://localhost:4200" } });

  io.on("connection", (socket) => {
    console.log("User is connected");
    socket.emit("message", "Message from server");

    socket.on("addRequest", async (request) => {
      console.log(request);
      const newRequest = new Request(request);
      const requests = await Request.find({});

      const isAlreadySent = requests.some(
        (req) =>
          req.sender.equals(newRequest.sender) &&
          req.reciever.equals(newRequest.reciever)
      );

      if (isAlreadySent) {
        return socket.emit("sentRequest", { result : 'failed' })
      }
      await newRequest.save();
      return socket.emit("sentRequest", { result : 'success' })
    });
  });
}

module.exports = setupWebSocket;
