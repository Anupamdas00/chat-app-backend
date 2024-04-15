const sockectio = require("socket.io");
const Request = require("../model/request-model");
const auth = require("../middleware/auth");
const User = require("../model/user-model");
const { addUser, removeUser } = require('../utils/users')
const {friendRequestNotification} = require('../utils/utility-function')


function setupWebSocket(server) {
  const io = sockectio(server, { cors: { origin: "http://localhost:4200" } });
  
  // io.use(auth)

  io.on("connection", async (socket) => {
    console.log("User is connected", socket.id);
    const {token} = socket.handshake.auth;

    const users = addUser(socket.id, token);
    console.log(users);

    socket.emit("message", "Message from server");

    socket.on("addRequest", async (request) => {
      const newRequest = new Request(request);
      const requests = await Request.find({});

      const isAlreadySent = requests.some(
        (req) =>
          req.sender.equals(newRequest.sender) &&
          req.reciever.equals(newRequest.reciever)
      );

      if (isAlreadySent) {
        socket.emit("sentRequest", { result : 'failed' })
      } else {
        await newRequest.save();
        socket.emit("sentRequest", { result : 'success' })
      }

       const req = await friendRequestNotification(token, User);
       io.to(socket.id).emit('recievedReq', req.map((doc) => ({
          name : doc.name,
          id : socket.id
        })
      ))
    });

    socket.on('disconnect', () => {
      console.log('user left the chat', socket.id);
      io.emit('onleave', "User left from chat")
      const user = removeUser(socket.id)
      console.log(user);
    })
  });
}

module.exports = setupWebSocket;
