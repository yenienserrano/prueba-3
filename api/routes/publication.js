var express = require('express');
var PublicationControllers = require('../controllers/publication');
var api = express.Router();
var mdAuth = require('../middleware/authenticated');
var multipart = require('connect-multiparty');
var mdUpload = multipart({uploadDir: './uploads/publication'});

api.post('/publication', mdAuth.ensureAuth, PublicationControllers.savePublication);
api.get('/publications/:page?',mdAuth.ensureAuth, PublicationControllers.getPublications);
api.get('/publication/:id',mdAuth.ensureAuth, PublicationControllers.getPublication);
api.delete('/publication/:id',mdAuth.ensureAuth, PublicationControllers.deletePublication);
api.post('/upload-image-pub/:id', [mdAuth.ensureAuth, mdUpload], PublicationControllers.uploadImage);
api.post('/upload-image-pub/:imageFile', mdAuth.ensureAuth, PublicationControllers.getImageFile);


module.exports = api;