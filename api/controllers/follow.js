'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follows');

function saveFollow(req, res){
    var params = req.body;
    var follow = new Follow();
    follow.user = req.user.sub;
    follow.followed = params.followed;

    follow.save((err, followStored)=>{
        if(err) return res.status(500).send({message:'error en guardar el follow'})

        if(!followStored) return res.status(404).send({message: 'el seguimiento no se ha guardado'})

        return res.status(200).send({follow: followStored})
    })
}

function deleteFollow(req, res){
    var userId = req.user.sub;
    var followId = req.params.id;

    Follow.find({'user':userId, 'followed': followId}).remove(err => {
        if(err) return res.status(500).send({message:'dejar de seguir'})
    })

    return res.status(200).send({message: 'el follow se ha eliminado'})
}

function getFollowingUsers(req, res){
    var userId = req.user.sub;

    if(req.params.id && req.params.page){
        userId = req.params.id;
    }

    var page = 1;
    
    if(req.params.page){
        page = req.params.page;
    }else{
        page = req.params.id;
    }

    var itemsPrePage = 4;

    Follow.find({user: userId}).populate({path:'followed'}).paginate(page, itemsPrePage, (err, follows, total)=>{
        if(err) return res.status(500).send({message:'error en el servidor'})

        if(!follows) return res.status(404).send({message: 'no estas siguiendo a ningun usuario'})

        followUserIds(req.user.sub).then((value) => {
            return res.status(200).send({
                total: total,
                pages: Math.ceil(total/itemsPrePage),
                userFollowMe: value.followed,
                userFollowing: value.following,
                follows

            })
        })  
    })
}

function getFollowedUser(req, res){
    var userId = req.user.sub;

    if(req.params.id && req.params.page){
        userId = req.params.id;
    }

    var page = 1;
    
    if(req.params.page){
        page = req.params.page;
    }else{
        page = req.params.id;
    }

    var itemsPrePage = 4;

    Follow.find({followed: userId}).populate('user').paginate(page, itemsPrePage, (err, follows, total)=>{
        if(err) return res.status(500).send({message:'error en el servidor'})

        if(!follows) return res.status(404).send({message: 'no te sigue ningun usuario'})

        followUserIds(req.user.sub).then((value) => {
            return res.status(200).send({
                total: total,
                pages: Math.ceil(total/itemsPrePage),
                userFollowMe: value.followed,
                userFollowing: value.following,
                follows

            })
        })    
        
    })
}

async function followUserIds(user_id){
    var following = await Follow.find({'user':user_id}).select({'_id':0, '__v':0, 'user':0})

    var followed = await Follow.find({'followed':user_id}).select({'_id':0, '__v':0, 'followed':0})

        var followingClean = [];

        following.forEach((follow)=>{
            followingClean.push(follow.followed);
        });


        var followedClean = [];

        followed.forEach((follow)=>{
            followedClean.push(follow.user);
               
    });

    return {
        following: followingClean,
        followed: followedClean
    }

}

//devolver listado de usuarios
function getMyFollows(req, res){
    var userId = req.user.sub;

    var find = Follow.find({user: userId});
    
    if(req.params.followed){
        find = Follow.find({follow: userId});
    }

    find.populate('user followed').exec((err, follows)=>{
        if(err) return res.status(500).send({message:'error en el servidor'})

        if(!follows) return res.status(404).send({message: 'no estas siguiendo a ningun usuario'})

        return res.status(200).send({follows})
    })
}


module.exports = {
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUser,
    getMyFollows
}