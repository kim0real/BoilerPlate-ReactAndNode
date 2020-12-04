const mongoose = require('mongoose')

const usrScheme = mongoose.Schema({
    name : {
        type : String,
        minlength : 5
    },
    password : {
        type : String,
        minlength : 5
    },
    lastname : {
        type : String,
        maxlength : 5
    },
    role : {
        type : Number,
        default : 0
    },
    image : String,
    token : {
        type : String
    },
    tokenExp : { // Experation
        type : String
    }
});

const User = mongoose.model('User', usrScheme)

module.exports = {User}

