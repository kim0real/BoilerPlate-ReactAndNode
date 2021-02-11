const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken')

const userScheme = mongoose.Schema({
    name : {
        type : String,
        minlength : 3
    },
    email : {
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

userScheme.pre('save', function(next){
    var user = this; // this : userScheme

    if(user.isModified('password')){
        //비밀번호 암호화
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err);

            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) return next(err)
                user.password = hash
                next()
            });
        });
    } else{
        next()
    }
})

userScheme.methods.comparePassword = function(plainPassword, cb){ // cb : callback
    //plainPassword을 암호화한 후 DB의 암호화된 비밀번호와 비교한다.
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err)
        cb(null, isMatch) // else문 true
    })
}

userScheme.methods.generateToken = function(cb){
    var user = this;

    //jsonwebtoken을 이용하여 토큰 생성
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    user.token = token
    user.save(function(err, user){
        if(err) return cb(err)
        cb(null, user)
    })
}

userScheme.statics.findByToken = function(token, cb){
     var user = this;

     //토큰을 decode한다.
     jwt.verify(token, 'secretToken', function(err, decoded){
         //유저 아이디를 이용해서 유저를 찾은 후
         //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
         user.findOne({"_id" : decoded, "token" : token}, function (err, user){
             if(err) return cb(err);
             cb(null, user)
         })
     })
}

const User = mongoose.model('User', userScheme)

module.exports = {User} // 다른 모듈에서 쓸 수 있도록 export

