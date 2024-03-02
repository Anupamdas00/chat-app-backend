const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const schema = new Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        unique : true,
        required : true,
        trim : true
    },
    phoneNumber : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
        trim : true
    },
    tokens : [
        {
            token : {
                type : String
            }
        }
    ]
})
// required : true

schema.virtual('sentRequest', {
    ref : 'Requests',
    localField : '_id',
    foreignField : 'sender'
})

schema.virtual('recievedRequest', {
    ref : 'Request',
    localField : '_id',
    foreignField : 'reciever'
})


schema.methods.toJSON = function(){
    const user = this;
    const userObj = user.toObject();

    delete userObj.password;
    delete userObj.tokens;

    return userObj;
}


schema.methods.generateAuthToken = async function(next){
    const user = this;
    const token = jwt.sign({ _id : user._id.toString()}, 'fullstackchatapp');
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

schema.statics.findByCredential = async function(email, password){
    const user = await User.findOne({ email });
    if(!user){
        throw new Error('Email and Password are invalid')
    };

    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if(!isPasswordMatch){
        throw new Error('Email and Password are invalid')
    }
    return user;
}

schema.pre('save', async function(next) {
    const user = this;

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }
    next()
} )

const User = mongoose.model('Users', schema);

module.exports = User;