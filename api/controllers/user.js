'use strict'

var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../service/jwt');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');
var Follow = require('../models/follows')
var Publication = require('../models/publication');

function home(req, res){
    res.status(200).send({
        message: 'home'
    })    
}

function pruebas(req, res){
    res.status(200).send({
        message: 'Accion de prueba andando'
    })    
}

function saveUser(req, res){
    var params = req.body;
    var user = new User();

    if(params.name && params.surname && params.email && 
    params.nick && params.password){

        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'Role_user';
        user.image = null;

        User.find({ $or: [
            {email: user.email.toLowerCase()},
            {nick: user.nick.toLowerCase()}
        ]}).exec((err, users) => {
            if(err) return res.status(500).send({message: 'Error en la peticion'})
            if(users && users.length >= 1){
                return res.status(200).send({message: 'el email o nick ya existen'})
            }else{
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash
        
                    user.save((err, userStored) => {
                        if(err) return res.status(500).send({
                            message: 'Error al guardar el usuario'
                        })
        
                        if(userStored){
                            res.status(200).send({user: userStored})
                        }else{
                            res.status(404).send({
                                message: 'el usuario no pudo ser registrado'
                            })
                        }
                    })
                }) 
            }
        })  
    }
}
function loginUser(req, res){
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({email: email}, (err, user) => {
        if(err) return res.status(500).send({message:'error en la peticion'})

        if(user){
            bcrypt.compare(password, user.password, (err, check)=>{
                if(check){
                    if(params.gettoken){
                        // generar y devolver token
                        res.status(200).send({
                            token: jwt.createToken(user)
                        })
                    }else{
                        //devolver datos de usuario
                        user.password = undefined;
                        return res.status(200).send({
                            user
                        })
                    }
                   
                }else{
                    if(err) return res.status(404).send({message:'usuario no existe'})
                }
            })
        }else{
            if(err) return res.status(404).send({message:'usuario no existe'})
        }
    })
}

//conseguir datos de un usuario

function getUser(req, res){
    var userId = req.params.id;

    User.findById(userId, (err, user) => {
        if(err){
            return res.status(500).send({
                message: 'error en la peticion'
            })
        }
        if(!user) return res.status(404).send({
            message: 'el usuario no existe'
        })

        Follow.findOne({'user':req.user.sub, 'followed':userId}).exec((err, follow)=>{
            if(err){
                return res.status(500).send({
                    message: 'error al comprobar el seguimiento'
                })
            }
            
            return res.status(200).send({user, follow})
        })

    })
}

async function followThisUser(identityUserId, userId){
    var following = await Follow.findOne({'user':identityUserId, 'followed':userId}).exec((err,follow)=>{
        if(err) return handleError(err);
        return follow;
    })
    var followed = await Follow.findOne({'user':userId, 'followed':identityUserId}).exec((err,follow)=>{
        if(err) return handleError(err);
        return follow;
    })
    return{
        following: following,
        followed: followed
    }
}

function getUsers(req, res){
    var identityUserId = req.user.sub;

    var page = 1;

    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 5;

    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total)=>{
        if(err) return res.status(500).send({message: 'error en la peticion'})

        if(!users) return res.status(404).send({message: 'no hay usuarios disponibles'})

        followUserIds(identityUserId).then((value) => {
            return res.status(200).send({
                users,
                usersFollowing: value.following,
                usersFollowMe: value.followed,
                total,
                pages: Math.ceil(total/itemsPerPage)
            })
        })
        
    })
}

async function followUserIds(user_id){
    var following = await Follow.find({'user':user_id}).select({'_id':0, '__v':0, 'user':0}).exec((err, follows)=> {
        var followsClean = [];

        follows.forEach((follow)=>{
            followsClean.push(follow.followed);
        });

       return followsClean;
    });

    var followed = await Follow.find({'followed':user_id}).select({'_id':0, '__v':0, 'followed':0}).exec((err, follows)=> {
        var followedClean = [];

        follows.forEach((follow)=>{
            followsClean.push(follow.user);
        });

        return followedClean;
    });

    return {
        following: following,
        followed: followed
    }

}

function getCounters(req, res){
    var userId = req.user.sub;
    if(req.params.id){
        userId = req.params.id;  
    }
    getCountFollow(req.params.id).then((value)=>{
        return res.status(200).send(value)
    })
    
}

async function getCountFollow(userId){
    var following = await Follow.count({'user': userId}).exec((err,count)=>{
        if(err) return handleError(err)
        return count;
    })
    var followed = await Follow.count({'followed':userId}).exec((err, count)=>{
        if(err) return handleError(err)
        return count;
    })
    var publications = await Publication.count({'user': userId}).exec((err, count)=>{
        if(err) return handleError(err);
        return count;
    })

    return {
        following: following,
        followed: followed,
        publications: publications
    }
}

//edicion de datos del usuario

function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;

    //borrar la propiedad password
    delete update.password;

    if(userId != req.user.sub){
        return res.status(500).send({
            message: 'no tienes permiso para actualizar ese usuario'
        })
    };

    
        
    User.find({ $or: [
        {email: update.email},
        {nick: update.nick}
    ]}).exec((err, users) => {

        var userIsset = false;
        users.forEach((user) =>{
            if(user && user._id != userId) userIsset = true;
        });

        if(userIsset) return res.status(404).send({message: 'Los datos ya estan en uso'});
        
        User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
            if(err) return res.status(500).send({
                message: 'no tienes permiso para actualizar ese usuario'
            })
             if(!userUpdated) return res.status(404).send({
                 message: 'no sea podido actualizar el usuario'
            }) 
            return res.status(200).send({
                user: userUpdated
            })
        })

    })
    
    
}

// subir archivo de imagen

function updateImage(req, res){
    var userId = req.params.id;
    
   
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
            //actualizar documento del usuario logueado
            User.findByIdAndUpdate(userId, {image: fileName}, {new:true},(err, userUpdated)=>{
                if(err) return res.status(500).send({
                    message: 'no tienes permiso para actualizar ese usuario'
                })
                 if(!userUpdated) return res.status(404).send({
                     message: 'no sea podido actualizar el usuario'
                }) 
                return res.status(200).send({
                    user: userUpdated
                })
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
    var pathFile = './uploads/users/'+imageFile;

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
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    getCounters,
    updateUser,
    updateImage,
    getImageFile
}