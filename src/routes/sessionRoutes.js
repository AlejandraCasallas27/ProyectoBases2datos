
const express = require('express');
const sessionController = require('../controllers/sessionController');

const router = express.Router();

router.post('/', sessionController.createSession);

module.exports = router;
