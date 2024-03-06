const sockectio = require("socket.io");
const Request = require('../model/request-model')

function setupWebSocket(server) {
  const io = sockectio(server, { cors: { origin: "http://localhost:4200" } });

  io.on("connection", (socket) => {
    console.log("User is connected");
    socket.emit("message", "Message from server");

    socket.on("addRequest", async (request) => {
      const newRequest = new Request(request);
      const requestSave = await newRequest.save()
      if(!requestSave){
        return console.log('Request Not saved');
      }
    });
  });
}

module.exports = setupWebSocket;
