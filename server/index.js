//백앤드 시작점
const express = require('express') //package.json의 express 모듈을 가져온다.
const app = express() // express앱 생성
const port = 3000 // 포트, 임의로 설정 가능
const bodyParser = require('body-parser');
const config = require('./config/key')
const {User} = require("./models/User");
const {auth} = require("./middleware/auth");
const cookieParser = require('cookie-parser');

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}));

//application/json
app.use(bodyParser.json());
app.use(cookieParser())

const mongoose = require('mongoose')
//몽고DB 연결
mongoose.connect(config.mongoURI, {
    useNewUrlParser : true, useUnifiedTopology : true, useCreateIndex : true, useFindAndModify : false
}).then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log('err'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})  

//register 라우트
app.post('/api/users/register', (req, res) =>{
    //회원가입할때 필요한 정보들을 client에서 가져오면 
    //그것들을 데이터베이스에 넣어준다.
    const user = new User(req.body)

    user.save((err, userInfo) => {
        console.log("userInfo:"+userInfo)
        if(err) {
            return res.json({success : false, err})
        }
        return res.status(200).json({
            success : true
        })
    });
})

app.post('/api/users/login', (req, res) =>{

    //요청된 이메일이 디비에 있는지 찾는다.
    User.findOne({email : req.body.email}, (err, user) => {
        if(!user){
            return res.json({
                loginSuccess : false,
                message : "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }
        //이메일이 있다면 비밀번호가 맞는지 비교한다.
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch){
                return res.json({
                    loginSuccess : false,
                    message : "비밀번호가 틀렸습니다."
                })
            //비밀번호까지 맞을 경우 토큰 생성
            } 
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);

                //토큰을 쿠키에 저장한다.
                return res.cookie("x_auth", user.token)
                .status(200)
                .json({
                    loginSuccess : true,
                    userId : user._id
                })
            })
        })
    })
})


app.get('/api/users/auth', auth, (req, res) => {
    //여기까지 미들웨어를 통과했다는 이야기는 Authentication이 true라는 말
    res.status(200).json({
        _id : req.user._id,
        isAdmin : req.user.role == 0 ? false : true,
        isAuth : true,
        email : req.user.email,
        name : req.user.name,
        lastname : req.user.lastname,
        role : req.uesr.role,
        iamge : req.user.image
    })
})

app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({_id : req.user._id},
        {token : ""}
        , (err, user) => {
            if(err) return res.json({success : false, err});
            return res.status(200).send({
                success : true
            })
        })
})

// 포트를 통해 index.js를 실행
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

