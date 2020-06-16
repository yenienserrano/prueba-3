'use strict'

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginatie = require('mongoose-pagination');

var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follows');

function savePublication(req, res){
    var params = req.body;

    if(!params.text){
        return res.status(200).send({
            message: 'debes enviar un texto'
        })
    }

    var publication = new Publication();

    publication.text = params.text;
    publication.file = null;
    publication.user = req.user.sub;
    publication.createdAt = moment().unix();
    publication.save((err, publicationStored) => {
        if(err){
            return res.status(500).send({
                message: 'error al guardar publicacion'
            })
        }
        if(!publicationStored){
            return res.status(500).send({
                message: 'no se guardo la publicacion'
            })
        }
        return res.status(200).send({
            publication: publicationStored
        })

    })
}

function getPublicationsUser(req, res){
    var page = 1;

    if(req.params.page){
        page = req.params.page;
    }
    var user = req.user.sub;
    if(req.params.user){
        var user = req.params.user;
    }

    var itemsPrePage = 4;

    Publication.find({user: user,}).sort('-createdAt').populate('user').paginate(page, itemsPrePage, (err, publications, total) => {

        if(err){
            return res.status(500).send({
                message: 'error al devolver publicaciones'
            })
        }
        if(!publications){
            return res.status(404).send({
                message: 'no hay publicaciones'
            })
        }
        
        res.status(200).send({
            totalItems : total,
            pages: Math.ceil(total/itemsPrePage),
            page: page,
            itemsPrePage: itemsPrePage,
            publications
        })
        
        
    })
}        
    


function getPublications(req, res){
    var page = 1;

    if(req.params.page){
        page = req.params.page;
    }

    var itemsPrePage = 4;

    

    Follow.find({user: req.user.sub}).populate('followed').exec((err, follows) => {
        if(err){
            return res.status(500).send({
                message: 'error al volver seguimientos'
            })
        }
        
        var followsClean = [];

        follows.forEach((follow) => {
            followsClean.push(follow.followed)
        })

        followsClean.push(req.user.sub)

        Publication.find({user: {"$in": followsClean}}).sort('-createdAt').populate('user').paginate(page, itemsPrePage, (err, publications, total) => {

            if(err){
                return res.status(500).send({
                    message: 'error al devolver publicaciones'
                })
            }
            if(!publications){
                return res.status(404).send({
                    message: 'no hay publicaciones'
                })
            }
            
            res.status(200).send({
                totalItems : total,
                pages: Math.ceil(total/itemsPrePage),
                page: page,
                itemsPrePage: itemsPrePage,
                publications
            })
            console.log(followsClean)
            
        })
        
    })
}

function getPublication(req, res){
    var publicationId = req.params.id;

    Publication.findById(publicationId,(err, publication) => {
        if(err){
            return res.status(500).send({
                message: 'error al devolver publicaciones'
            })
        }
        if(!publication){
            return res.status(404).send({
                message: 'no existe la publicacion'
            })
        }
        return res.status(200).send({publication})
    })
}

function deletePublication(req, res){
    var publicationId = req.params.id;

    Publication.find({'user': req.user.sub, '_id': publicationId}).remove(err => {
        if(err){
            return res.status(500).send({
                message: 'error al borrar publicaciones'
            })
        }
    
        return res.status(200).send({message: 'publicacion eliminada'})
    })
}

function uploadImage(req, res){
    var publicationId = req.params.id;
    
   
    if(req.files){
        var filePath = req.files.image.path;
        var fileSplit = filePath.split('\\');
        var fileName = fileSplit[2];
        var extSplit = fileName.split('\.');
        var fileExt = extSplit[1];

        if(userId != req.user.sub){
            return removeFilesOfUploads(res, filePath, 'no tienes permiso para actualizar ese usuario')
        }
        
        if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){
            Publication.findOne({"user": req.user.sub , "_id":publicationId}).exec((err, publication) => {
                if(publication){
            //actualizar documento de la publicacion
                   
                    Publication.findByIdAndUpdate(publicationId, {file: fileName}, {new:true},(err, publicationUpdated)=>{
                        
                        if(err) return res.status(500).send({
                            message: 'no tienes permiso para actualizar ese usuario'
                        })
                         if(!publicationUpdated) return res.status(404).send({
                             message: 'no sea podido actualizar el usuario'
                        }) 
                        return res.status(200).send({
                            publication: publicationUpdated
                        })
                    })
                }else{
                    return removeFilesOfUploads(res, filePath, 'no tienes permiso para actualizar esta publicacion')
                }
            })            
        }else{
            return removeFilesOfUploads(res, filePath, 'extencion no valida')
        }
        
    }else{
        return res.status(200).send({
            message: 'no se a subido ninguna imagen'
        })
    }
}

function removeFilesOfUploads(res, filePath, message){
    fs.unlink(filePath, (err)=>{
        if(err) return res.status(200).send({message: message})
    })
}

function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var pathFile = './uploads/publication/'+imageFile;

    fs.exists(pathFile, (exists)=>{
        if(exists){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(200).send({
                message: 'no existe imagen'
            })
        }
    })
}

module.exports = {
    savePublication, 
    getPublications,
    getPublicationsUser,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
}