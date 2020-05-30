'use strict'

var moment = require('moment');
var mongoosePagination = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follows');
var Message = require('../models/message');

function saveMessage(req, res){
    var params = req.body;

    if(!params.text || !params.receiver){
        return res.status(200).send({message: 'envia bien los datos'})
    }

    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.createdAt = moment().unix();
    message.viewed = 'false';

    message.save((err, messageStored) => {
        if(err){
            return res.status(500).send({message: 'error en la peticion'})
        }
        if(!messageStored){
            return res.status(500).send({message: 'error al enviar el mensaje'})
        }
        return res.status(200).send({message: messageStored})
    })
}

function getReceivedMessages(req, res){
    var userId = req.user.sub;
    
    var page = 1;
    if(req.params.page){
        page = req.params.page
    }

    var itemsPrePage = 4;

    Message.find({receiver: userId}).populate('emitter', 'name surname _id nick image').paginate(page, itemsPrePage, (err, message, total) => {
        if(err){
            return res.status(500).send({message: 'error en la peticion'})
        }
        if(!message){
            return res.status(404).send({message: 'no hay mensajes que mostrar'})
        }
        return res.status(200).send({
            total:total,
            pages: Math.ceil(total/itemsPrePage),
            messages
        })

    })
}

function getEmittMessages(req, res){
    var userId = req.user.sub;
    
    var page = 1;
    if(req.params.page){
        page = req.params.page
    }

    var itemsPrePage = 4;

    Message.find({emitter: userId}).populate('emitter receiver', 'name surname _id nick image').paginate(page, itemsPrePage, (err, message, total) => {
        if(err){
            return res.status(500).send({message: 'error en la peticion'})
        }
        if(!message){
            return res.status(404).send({message: 'no hay mensajes que mostrar'})
        }
        return res.status(200).send({
            total:total,
            pages: Math.ceil(total/itemsPrePage),
            messages
        })

    })
}

function getUnviewedMessages(req, res){
    var userId = req.user.sub;

    Message.count({receiver: userId, viewed:'false'}).exec((err, count) => {
        if(err){
            return res.status(500).send({message: 'error en la peticion'})
        }
        return res.status(200).send({
            unviewed: count
        })
    })
}

function setViewedMessages(req, res){
    var userId = req.user.sub;

    Message.update({receiver: userId, viewed: 'false'},{viewed:'true'}, {'multi': true}, (err, messageUpdate) => {
        if(err){
            return res.status(500).send({message: 'error en la peticion'})
        }
        return res.status(200).send({
            message: messageUpdate
        })
    })
}

module.exports = {
    saveMessage,
    getReceivedMessages,
    getEmittMessages,
    getUnviewedMessages,
    setViewedMessages
}