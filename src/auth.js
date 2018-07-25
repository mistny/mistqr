const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = mongoose.model('User');

function register(email, password, errorCallback, successCallback) {
    if(password.length < 8) {
        console.log("PASSWORD TOO SHORT");
        errorCallback({message: "Password is too short."});
    } else {
        /* Find if the email (case-insensitive) already has an account */
        User.findOne({email: {'$regex': "^"+req.query.professor+"$", $options:'i'}}, (err, user) => {
            if (err) {
                console.log(err);
            } else {
                if (user) {
                    console.log("USERNAME ALREADY EXISTS");
                    errorCallback({message: "Email already has an account."});
                } else {
                    bcrypt.hash(password, 10, function(err, hash) {
                        if (err) {
                            console.log(err);
                        } else {
                            new User({
                                email: email,
                                password: hash,
                                rank: "None",
                                dateCreated: new Date();
                            }).save((err, savedUser) => {
                                if (err) {
                                    console.log(err);
                                    errorCallback({message: "Error please try again later"});
                                } else {
                                    successCallback(savedUser);
                                }
                            });
                        }
                    });
                }
            }
        });
    }
}

function login(email, password, errorCallback, successCallback) {
    User.findOne({email: email}, (err, user) => {
        if (err) {
            console.log(err);
        }
        if (!user) {
            console.log("USER NOT FOUND");
            errorCallback({message: "Email or password is incorrect."});
        } else {
            bcrypt.compare(password, user.password, (err, passwordMatch) => {
                if (err) {
                    console.log(err);
                }
                if (passwordMatch) {
                    successCallback(user);
                } else {
                    console.log("PASSWORDS DO NOT MATCH");
                    errorCallback({message: "Email or password is incorrect."});
                }
            });
        }
    });
}

function startAuthenticatedSession(req, user, cb) {
    req.session.regenerate((err) => {
        if (err) {
            console.log(err);
        }
        req.session.user = user;
        cb();
    });
}

module.exports = {
    startAuthenticatedSession: startAuthenticatedSession,
    register: register,
    login: login
};
