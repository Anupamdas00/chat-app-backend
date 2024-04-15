const users = {}

const addUser = (socketid,  token) => {
    users[socketid] = token;

    return users;
}


const removeUser = (id) => {
    for(key in users){
        if(key === id){
            delete users[key]
        }
    }
    return users;
}


module.exports = {
    addUser,
    removeUser
}