// thực hiện công việc xác thực người dùng
const express = require('express');
const router = express.Router()
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const verifyToken = require('../middleware/auth')

const User = require('../models/User')

//@route GET api/auth
//@decs Check if user is logged in
//@access Pulic
router.get('/', verifyToken, async(req, res)=> {
    try{
        const user = await User.findById(req.userId).select('-password')
        if(!user)
            return res.status(400).json({success:false, message:'User not found'})
        res.json({success: true, user})
    }catch(error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error'})
    }
})


//@route POST api/auth/register
router.post('/register', async (req, res) => {
    const { username, password } = req.body

    if (!username || !password)
        return res
            .status(400)
            .json({ success: false, message: 'Missing username and/or password'})

    try{
         //kiem tra user
        const user = await User.findOne({ username })
            
        if (user)
        return res.status(400).json({success: false, message: 'Username already taken'})

        //All good
        const hashedPassword = await argon2.hash(password)
        const newUser = new User({username, password: hashedPassword})
        await newUser.save()

        //Return token
        const accessToken = jwt.sign(
            {userId: newUser._id}, 
            process.env.ACCESS_TOKEN_SECRET
            )

            res.json({success: true, message: 'User created successfully', accessToken})
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error'})
    }  
})


//@route POST api/auth/login
router.post('/login', async(req, res) => {
    const {username, password} = req.body

    if(!username || !password)
    return res
        .status(400)
        .json({ success: false, massage: 'Missing username and/or password'})

    try{
        //check for existing user
        const user = await User.findOne({username})
        if(!user)
            return res
                .status(400)
                .json({success: false, message: 'Incorrect username or password '})

        //Use found
        const passwordVaild = await argon2.verify(user.password, password)
        if(!passwordVaild)
            return res
                .status(400)
                .json({success: false, message: 'Incorrect username or password'})

        //Return token
        const accessToken = jwt.sign(
            {userId: user._id}, 
            process.env.ACCESS_TOKEN_SECRET
        )

        res.json({
             success: true, 
            message: 'User logged in successfully', 
            accessToken
        })
    }catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error'})
    }     
})
module.exports = router