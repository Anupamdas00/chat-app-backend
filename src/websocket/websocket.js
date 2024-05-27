const sockectio = require("socket.io");
const Request = require("../model/request-model");
const auth = require("../middleware/auth");
const User = require("../model/user-model");
const { addUser, removeUser } = require("../utils/users");
const {
  generateRequestMsg,
  fetchReqNotification,
  recievedRequests,
  getSocketIdByUserId,
  getUsersByReqId,
  getAllFriendList,
} = require("../utils/utility-function");
const Friend = require("../model/friends-model");

function setupWebSocket(server) {
  const io = sockectio(server, { cors: { origin: "http://localhost:4200" } });

  // io.use(auth)

  io.on("connection", async (socket) => {
    console.log("User is connected", socket.id);
    const { token } = socket.handshake.auth;
    const { userEmail, userId } = socket.handshake.query;
    console.log("current user mongooseId", userId);
    let users = addUser(socket.id, token, userId, userEmail);
    console.log("Online users", users);

    socket.emit("message", "Message from server");

    const friendNames = await getAllFriendList(Friend, userId);
    socket.emit("friendlist", friendNames);

    // try{
    //   const friendNames = await getAllFriendList(Friend, userId);
    //   console.log('friends Id', friendNames);
    // }catch(err){
    //   console.log(err);
    // }

    // ---------------getting add request------------------
    // will work on this after addRequest event completion
    const recievedRequestsMsg = await recievedRequests(Request, userId);
    socket.emit("gotRequest", recievedRequestsMsg);

    // -----------------sending add request---------------------
    socket.on("addRequest", async (request) => {
      let sentReq = [];
      const newRequest = new Request(request);
      const storedRequests = await Request.find({});
      //sender is currently loggedin got token from frontend
      const sender = await User.findOne({ "tokens.token": token });

      const isAlreadySent = storedRequests.some(
        (req) =>
          req.sender.equals(newRequest.sender) &&
          req.reciever.equals(newRequest.reciever)
      );

      // ----if request has been already sent then failed-----------
      if (isAlreadySent) {
        socket.emit("sentRequest", { result: "failed" });
      } else {
        // for new request request is being saved but if the recived user is not online showing error because of the use is not online
        //that use data is not available to users array
        const saveRequest = await newRequest.save();
        socket.emit("sentRequest", { result: "success" });
        console.log("new saved request", saveRequest);

        const recievedUser = getSocketIdByUserId(
          users,
          saveRequest.reciever.toString()
        );
        const req = generateRequestMsg(saveRequest._id.toString(), sender.name);
        sentReq.push(req);
        io.to(recievedUser.socketid).emit("gotRequest", sentReq);
      }
    });

    // -------response on add request from user------------
    socket.on("responseOnAddRequest", async (data) => {
      console.log(data);

      if (data.responseType == "accepted") {
        try {
          const friend = await getUsersByReqId(Request, data.requestId);
          const newFriend = new Friend(friend);
          const newSavedFriend = await newFriend.save();

          // deleting the reqeust from request collection once it responded
          if (newSavedFriend) {
            await Request.findByIdAndDelete({ _id: data.requestId });
          }

          // getting added friends names for loggedin user
          const friendNames = await getAllFriendList(Friend, userId);
          socket.emit("friendlist", friendNames);
        } catch (err) {
          console.error(err);
        }
      }
    });

    // ------event for user loggingout
    socket.on("loggedOut", (tokenId) => {
      console.log("user logout");
      const user = removeUser(tokenId);
      console.log("loggedout user details", user);

      // call disconnect event----
      socket.disconnect(true);
      console.log(`${socket.id} has been loggedgout`);
    });

    socket.on("disconnect", () => {
      const user = removeUser(socket.id);
      console.log("user disconnected:", user);
    });
  });
}

module.exports = setupWebSocket;
