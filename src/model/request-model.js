const mongoose = require('mongoose');
const {Schema} = require('mongoose')


const schema = new Schema(
    {
        sender : {
            type : Schema.Types.ObjectId,
            ref : 'Users',
            required : true,
        },
        reciever : {
            type : Schema.Types.ObjectId,
            ref : 'Users',
            required : true,
        },
        status : {
            type : String,
            enum : ['accepted', 'pending', 'rejected'],
            required : true,
            default : 'pending'
        }
    },
    {
        timestamps : true
    }
)

const Request = mongoose.model('Requests', schema);

module.exports = Request;
