'use strict'

var express = require('express');
var UserController = require('../controllers/user');
var mdAuth = require('../middleware/authenticated');
var multipart = require('connect-multiparty');
var mdUpload = multipart({uploadDir: './uploads/users'});

var api = express.Router();

api.get('/home', UserController.home);
api.get('/pruebas', mdAuth.ensureAuth, UserController.pruebas);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.post('/user/:id', mdAuth.ensureAuth, UserController.getUser);
api.get('/users/:page?', mdAuth.ensureAuth, UserController.getUsers);
api.get('/counters/:id?', mdAuth.ensureAuth, UserController.getCounters);
api.put('/update-user/:id', mdAuth.ensureAuth, UserController.updateUser);
api.post('/update-image-user/:id', [mdAuth.ensureAuth, mdUpload], UserController.updateImage);
api.get('/get-image-user/:imageFile', UserController.getImageFile);

module.exports = api;