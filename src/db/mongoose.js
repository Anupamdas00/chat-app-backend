const mongoose = require('mongoose');

const dbUrl = "mongodb://127.0.0.1:27017";

mongoose.connect(dbUrl + '/chat-db')