const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 




router.get('/chat', auth, (req, res) => {

})