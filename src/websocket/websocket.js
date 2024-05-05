const sockectio = require("socket.io");
const Request = require("../model/request-model");
const auth = require("../middleware/auth");
const User = require("../model/user-model");
const { addUser, removeUser } = require("../utils/users");
const { addRequestMessage, fetchReqNotification, recievedRequests } = require('../utils/utility-function');


function setupWebSocket(server) {
  const io = sockectio(server, { cors: { origin: "http://localhost:4200" } });

  // io.use(auth)

  io.on("connection", async (socket) => {
    console.log("User is connected", socket.id);
    const { token } = socket.handshake.auth;
    const { userEmail, userId } = socket.handshake.query;
    console.log('current user mongooseId', userId);
    let users = addUser(socket.id, token, userEmail);
    console.log('Online users', users);

    socket.emit("message", "Message from server");

    // ---------------getting add notifications------------------
    // will work on this after addRequest event completion
    // const recievedRequestsMsg = await recievedRequests(Request, userId)
    // socket.emit('gotRequest', recievedRequestsMsg)


    // -----------------------notifying add request on login------------------------

   

    // -----------------sending add request---------------------
    socket.on("addRequest", async (request) => {
      console.log(request);
      const newRequest = new Request(request);
      const reqSaved = await newRequest.save();
      console.log('req saved', reqSaved);
      // const requests = await Request.find({});
      // const recieverName = await User.findOne({'tokens.token' : token })

      // const isAlreadySent = requests.some(
      //   (req) =>
      //     req.sender.equals(newRequest.sender) &&
      //     req.reciever.equals(newRequest.reciever)
      // );

      // if (isAlreadySent) {
      //   socket.emit("sentRequest", { result: "failed" });
      // } else {
      //   await newRequest.save();
      //   socket.emit("sentRequest", { result: "success" });
      // }

    });


    // ------event for user loggingout
    socket.on('loggedOut', (tokenId) => {
      console.log('user logout');
      const user = removeUser(tokenId);
      console.log('loggedout user details', user);

      // call disconnect event----
      socket.disconnect(true)
      console.log(`${socket.id} has been loggedgout`);
    })

    socket.on("disconnect", () => {
      const user = removeUser(socket.id);
      console.log('user disconnected:',  user);
    });
  });
}

module.exports = setupWebSocket;
