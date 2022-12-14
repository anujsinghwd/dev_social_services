const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const passport = require('passport');

// Load Input Validation
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');

// Load users Model
const User = require('../models/Users');

// @route   GET api/users/test
// @dsec    Tests Users route
// @access  Public
router.get('/test', (req, res) => {
    res.json({msg: "users works"});
});

// @route   GET api/users/register
// @dsec    Register User
// @access  Public
router.post('/register', (req, res) => {
    const {errors, isValid} = validateRegisterInput(req.body);

    // Cheack Validation
    if(!isValid){
         return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email })
        .then(user => {
            if(user){
                errors.email = 'Email already exists';
                return res.status(400).json(errors);
            }else{
                const avatar = gravatar.url(req.body.email, {
                    s: '200', //Size
                    r: 'pg', //ratings
                    d: 'mm' //default
                });
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                })
            }
        })
});

// @route   GET api/users/login
// @dsec    Login User / Returning JWT Token
// @access  Public
router.post('/login', (req, res) => {

    const {errors, isValid} = validateLoginInput(req.body);

    // Cheack Validation
    if(!isValid){
         return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    //FInd User By Email
    User.findOne({email})
        .then(user => {
            //Check For Users
            if(!user){
                errors.email = 'User not found';
                return res.status(404).json(errors);
            }

            //Check Password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch){
                        //res.json({msg: 'Success'});
                        // User Matched
                        const payload = {id: user.id, name: user.name, avatar: user.avatar}; // Create jwt payload

                        //Sign Token
                        jwt.sign(payload, keys.secretOrKey, {expiresIn: 3600}, (err, token) => {
                            res.json({
                                success: true,
                                token: 'Bearer '+token,
                                type: 'Bearer',
                                expiresIn: 3600
                            })
                        });
                    } else {
                        errors.password = 'Password Incorrect';
                        return res.status(400).json(errors);
                    }
                })
        })
});

// @route   GET api/users/current
// @dsec    Register current user
// @access  Private
router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});

module.exports = router;
