const friendRequestNotification = async (token, userModel) => {
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

module.exports = {
    friendRequestNotification
}   

