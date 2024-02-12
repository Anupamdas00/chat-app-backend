const express = require('express');
const cors = require('cors')
require('./db/mongoose');
const port = process.env.port || 3000;
const userRouter = require('./router/user-router');
const sockectio = require('socket.io');
const http = require('http')

const app = express();

app.use(cors())
app.use(express.json())
app.use(userRouter)
const server = http.createServer(app)
const io = sockectio(server, { cors : { origin : 'http://localhost:4200' } })

app.get('/', (req, res) => {
    res.send('welcome to chat')
})

io.on('connection', (socket) => {
    socket.emit('message','Message from server')
})


server.listen(port, () => {
    console.log('Server is running on', port);
})

// const hashing = async () => {
//     const hashed = await bcrypt.hash('string', 8);
//     console.log(hashed);

//     const match = await bcrypt.compare('string', hashed);
//     console.log(match);
// }

// hashing()