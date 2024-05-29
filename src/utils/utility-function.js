// import moment from "moment";
const moment = require("moment");

const fetchReqNotification = async (token, userModel) => {
  let sentDoc;
  try {
    const user = await userModel
      .findOne({ "tokens.token": token })
      .populate("recievedRequest")
      .exec();
    const senderName = user.recievedRequest.map(async (doc) => {
      return await userModel.findById(doc.sender);
    });
    sentDoc = Promise.all(senderName)
      .then((result) => result)
      .catch((err) => err);

    return sentDoc;
  } catch (err) {
    console.log("Error in getting populated data", err);
  }
};

const recievedRequests = async (requestModel, id) => {
  try {
    const recievedReqs = await requestModel.find({ reciever: id });

    const sentRequestDetails = recievedReqs.map(async (request) => {
      const doc = await requestModel
        .findOne({ sender: request.sender })
        .populate("sender")
        .exec();
      const requestId = request._id.toString();
      // const createdAt = moment(request.createdAt).format("dd-mm-yyyy HH:MM:SS");
      const createdAt = request.createdAt;
      return { requestId, name: doc.sender.name, createdAt };
    });
    requestObj = Promise.all(sentRequestDetails).then((res) => res);
    return (await requestObj).map((req) => {
      return generateRequestMsg(req.requestId, req.name, req.createdAt);
    });
  } catch (error) {
    console.error("Error in retrieving notification message", error);
  }
};

const generateRequestMsg = (requestId, name, createdReq) => {
  const reqMsg = {
    msg: `${name} has sent you friend request`,
    requestId,
    createdAt: createdReq,
  };
  return reqMsg;
};

const getSocketIdByUserId = (onlineUsers, sentUserId) => {
  const user = onlineUsers.find((user) => user.userId === sentUserId);
  console.log("user from getSocketIdByUserId function", user);
  return user.socketid;
};

const getUsersByReqId = async (requestModel, reqId) => {
  try {
    const reqDoc = await requestModel.find({ _id: reqId });
    const [user1, user2] = [reqDoc[0].sender, reqDoc[0].reciever];
    return { user1, user2 };
  } catch (err) {
    throw new Error(`Error in getting doc ${err}`);
  }
};

const getAllFriendList = async (friendModel, id) => {
  try {

    //getting the docs of the loggedin user from friends collection with populated data
    const friendDoc = await friendModel.find({
      $or: [{ user1: id }, { user2: id }],
    }).populate('user1','name').populate('user2', 'name').exec()

    //returning friendname only from each documents
    const frinedNames = friendDoc.map((doc) => {
      const friend =
        doc.user1._id.toString() === id
          ? { id : doc.user2._id, name : doc.user2.name }
          : doc.user2._id.toString() === id
          ? { id : doc.user1._id, name : doc.user1.name }
          : null;

      return friend;
    }); 
    return frinedNames;
  } catch (err) {
    throw new Error("Error getting FrinedList", err);
  }
};

const getAcceptedRequestSenderId = (addedFriendObj, otherUserId) => {
  if(addedFriendObj.user1.toString() !== otherUserId){
    return addedFriendObj.user1.toString();
  }
  return addedFriendObj.user2.toString()
}

module.exports = {
  fetchReqNotification,
  generateRequestMsg,
  recievedRequests,
  getSocketIdByUserId,
  getUsersByReqId,
  getAllFriendList,
  getAcceptedRequestSenderId
};
