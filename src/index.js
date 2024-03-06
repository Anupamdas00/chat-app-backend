const express = require('express');
const cors = require('cors')
require('./db/mongoose');
const port = process.env.port || 3000;
const userRouter = require('./router/user-router');
const sockectio = require('socket.io');
const http = require('http')
const websocket = require('./websocket/websocket')


const app = express();

app.use(cors())
app.use(express.json())
app.use(userRouter)
const server = http.createServer(app)
websocket(server);


app.get('/', (req, res) => {
    res.send('welcome to chat')
})


server.listen(port, () => {
    console.log('Server is running on', port);
})
