const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = mongoose.model('User');

function register(username, email, password, errorCallback, successCallback) {
    if(username.length < 8 || password.length < 8) {
        console.log("USERNAME PASSWORD TOO SHORT");
        errorCallback({message: "USERNAME PASSWORD TOO SHORT"});
    } else {
        User.findOne({username: username}, (err, user) => {
            if (err) {
                console.log(err);
            }
            if (user) {
                console.log("USERNAME ALREADY EXISTS");
                errorCallback({message: "USERNAME ALREADY EXISTS"});
            } else {
                bcrypt.hash(password, 10, function(err, hash) {
                    if (err) {
                        console.log(err);
                    }
                    new User({
			username: username,
			email: email,
			password: hash,
                    }).save((err, savedUser) => {
                        if (err) {
                            console.log(err);
                            errorCallback({message: "DOCUMENT SAVE ERROR"});
                        } else {
                            successCallback(savedUser);
                        }
                    });
                });
            }
        });
    }
}

function login(username, password, errorCallback, successCallback) {
    User.findOne({username: username}, (err, user) => {
        if (err) {
            console.log(err);
        }
        if (!user) {
            console.log("USER NOT FOUND");
            errorCallback({message: "USER NOT FOUND"});
        } else {
            bcrypt.compare(password, user.password, (err, passwordMatch) => {
                if (err) {
                    console.log(err);
                }
                if (passwordMatch) {
                    successCallback(user);
                } else {
                    console.log("PASSWORDS DO NOT MATCH");
                    errorCallback({message: "PASSWORDS DO NOT MATCH"});
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
startAuthenticatedSession:
    startAuthenticatedSession,
register:
    register,
login:
    login
};
