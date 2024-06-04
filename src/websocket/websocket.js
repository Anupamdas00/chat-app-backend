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
  getAcceptedRequestSenderId
} = require("../utils/utility-function");
const Friend = require("../model/friends-model");
const { response } = require("express");

function setupWebSocket(server) {
  const io = sockectio(server, { cors: { origin: "http://localhost:4200" } });

  // io.use(auth)

  io.on("connection", async (socket) => {
    console.log("Connected user socket id", socket.id);
    const { token } = socket.handshake.auth;
    const { userEmail, userId } = socket.handshake.query;
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

        const recievedUserScocketId = getSocketIdByUserId(
          users,
          saveRequest.reciever.toString()
        );
        const req = generateRequestMsg(saveRequest._id.toString(), sender.name);
        sentReq.push(req);
        io.to(recievedUserScocketId).emit("gotRequest", sentReq);
      }
    });

    // -------response on add request from user------------
    socket.on("responseOnAddRequest", async (data) => {
      if (data.responseType == "accepted") {
        try {
          const friend = await getUsersByReqId(Request, data.requestId);
          const newFriend = new Friend(friend);
          const newSavedFriend = await newFriend.save();

          // deleting the reqeust from request collection once it responded
          if (newSavedFriend) {
            await Request.findByIdAndDelete({ _id: data.requestId });
          }

          // updating current loggedIn user's friendlist-----------------------------------------------
          let acceptedReqUserId;
          if(friend.user1.toString() == userId){
            acceptedReqUserId = friend.user2.toString();
          } else if(friend.user2.toString() == userId){
            acceptedReqUserId = friend.user1.toString();
          } else {
            console.log('Request sent userId not found');
          }

          //finding user with acceptedReqUserId id
          const userDetailsWhoSentReq = await User.findById(acceptedReqUserId);
          const friendDetailsToSent = [{ id : userDetailsWhoSentReq.id.toString(), name : userDetailsWhoSentReq.name }];
          socket.emit("friendlist", friendDetailsToSent);

          //------sending friendname to add to userlist, who sent friend request is accepted-----------
          const requestAcceptedSenderId = getAcceptedRequestSenderId(newSavedFriend, userId);
          //getting the  user's socket.id from onlineUser array when log in
          const getUserSocketId = getSocketIdByUserId(users, requestAcceptedSenderId)
          const acceptedRequestUserDetails = await User.findById(userId);
          io.to(getUserSocketId).emit("friendlist", [{ id : userId, name : acceptedRequestUserDetails.name }])
        } catch (err) {
          console.error(err);
        }
      } else if (data.responseType == 'rejected'){
        await Request.findByIdAndDelete({ _id: data.requestId });
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
