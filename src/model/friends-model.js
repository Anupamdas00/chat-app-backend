const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const schema = new Schema(
    {
        user1 : {
            type : Schema.Types.ObjectId,
            ref : 'Users',
            required : true,
        },
        user2 : {
            type : Schema.Types.ObjectId,
            ref : 'Users',
            required : true,
        }
    },
    {
        timestamps : true,
    }
)

const Friend = mongoose.model('Friends', schema);

module.exports = Friend;