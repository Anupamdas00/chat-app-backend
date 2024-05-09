const fetchReqNotification = async (token, userModel) => {
  let sentDoc;
    try{
        const user = await userModel.findOne({ 'tokens.token' : token}).populate('recievedRequest').exec()
        const senderName = user.recievedRequest.map(async (doc) => {
          return await userModel.findById(doc.sender)
        })
        sentDoc = Promise.all(senderName).then((result) => result).catch((err) => err)

        return sentDoc
        
      }catch(err){
        console.log('Error in getting populated data', err);
      }
}

const recievedRequests = async (requestModel, id) => {
  let notificationsMsg;
  try{
    const recievedReqs = await requestModel.find({ "reciever" : id });

    const sentRequestDetails = recievedReqs.map(async (request) => {
      const doc = await requestModel.findOne({ 'sender' : request.sender  }).populate('sender').exec();
      const requestId = request._id.toString();
      return { requestId, name : doc.sender.name }
    })
    requestObj = Promise.all(sentRequestDetails).then(res => res);
    return (await requestObj).map((req) => {
      return generateRequestMsg(req.requestId, req.name)
    })

  } catch (error) {
    console.error('Error in retrieving notification message', error);
  }
}

const generateRequestMsg = (requestId ,name) => {
  return { msg : `${name} has sent you friend request`,  requestId}
}

const getSocketIdByUserId = (onlineUsers, sentUserId) => {
  console.log('-------',onlineUsers, sentUserId);
  const user = onlineUsers.find((user) => user.userId === sentUserId );
  console.log('user from getSocketIdByUserId function', user);
  return user;
}




module.exports = {
  fetchReqNotification,
  generateRequestMsg,
    recievedRequests,
    getSocketIdByUserId
}   
