'use strict'

var express = require('express');
var messageControllers = require('../controllers/message');
var api = express.Router();
var mdAuth = require('../middleware/authenticated');

api.post('/message', mdAuth.ensureAuth, messageControllers.saveMessage);
api.get('/my-messages/:page?', mdAuth.ensureAuth, messageControllers.getReceivedMessages);
api.get('/messages/:page?', mdAuth.ensureAuth, messageControllers.getEmittMessages);
api.get('/unviewed-messages', mdAuth.ensureAuth, messageControllers.getUnviewedMessages);
api.get('/set-viewed-messages', mdAuth.ensureAuth, messageControllers.setViewedMessages);


module.exports = api;

