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
    
    const senderNames = recievedReqs.map(async (request) => {
      const doc = await requestModel.findOne({ 'sender' : request.sender  }).populate('sender').exec();
      return doc.sender.name;
    })
    notificationsMsg = Promise.all(senderNames).then(res => res)
    return (await notificationsMsg).map((name) => addRequestMessage(name))

  } catch (error) {
    console.error('Error in retrieving notification message', error);
  }
}

const addRequestMessage = (name) => {
  return `${name} has sent you add request`
}





module.exports = {
  fetchReqNotification,
    addRequestMessage,
    recievedRequests
}   
