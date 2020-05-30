'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/curso_mean_social', {useMongoClient: true})
        .then(()=>{
            console.log('la coneccion esta bien')
            //crear servidor
            app.listen(port, ()=>{
                console.log('servidor corriendo')
            })
        })
        .catch(err => console.log(err))