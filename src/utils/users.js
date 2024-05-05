let users = []

const addUser = (socketid,  token, email) => {

    const user = { socketid, token, email };
    users.push(user)
    return users;
}


const removeUser = (id) => { 
    let userLoggedout;
    const index = users.findIndex((user) => user.socketid == id || user.token == id);
    if(index !== -1){
       userLoggedout = users.splice(index, 1)
    } else {
        console.log("user doesn't exist");
    }
    return userLoggedout;
}


// addUser('abc12345678', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJzkvTiTOmT2H6An8CJ8I', 'user@example.com')
// addUser('abc123456789', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJzkvTiTOmT2H6An8CJ8I', 'user@example.com')
// addUser('abc123456789', 'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJzkvTiTOmT2H6An8CJ8I', 'user@example.com')

// users = removeUser('yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJzkvTiTOmT2H6An8CJ8I')
// console.log('after del', users);

module.exports = {
    addUser,
    removeUser
}