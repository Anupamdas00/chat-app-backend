const mongoose = require('mongoose');
const { Schema } = require('mongoose')

const schema = new Schema(
    {
        senderId : {
            type : Schema.Types.ObjectId,
            ref : 'Users',
            required : true
        },
        recipientId : {
            type : Schema.Types.ObjectId,
            ref : 'Users',
            required : true
        },
        message : {
            type : String,
            required : true
        }
    },
    {
        timestamps : true
    }
)

const Message = mongoose.model('Messages', schema);

module.exports = Message;