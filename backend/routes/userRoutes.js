const express = require('express');
const router = express.Router();
const {
    registerOrLogin,
  } = require('../controllers/userController');
  


router.post('/auth', registerOrLogin);

module.exports = router;
