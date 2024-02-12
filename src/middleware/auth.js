const jwt = require('jsonwebtoken');
const User = require('../model/user-model')


const auth = async (req, res, next) => {
    try{
        const token = req.headers.authorization.replace('Bearer ','');
        const decode = jwt.verify(token, 'fullstackchatapp');
        const user = await User.findOne({ _id : decode._id, 'tokens.token' : token })
        if(!user){
            console.log('error in finding user');
            throw new Error();
        }
        req.token = token;
        req.user = user;
        next();
    }catch(error){
        console.log('error catched', error);
        res.status(401).send('Please Authenticate..')
    }
}

module.exports = auth;
