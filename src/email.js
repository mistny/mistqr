'use strict';
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN
    },
    tls: {
        rejectUnauthorized: false
    }
});

function send(to, subject, text, html, cb) {
    const mailOptions = {
        from: process.env.EMAIL_NAME + '<' + process.env.EMAIL + '>',
        to: to,
        subject: subject,
        text: text,
        html: html
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log('Email sent:', info.response);
            cb(info);
        }
    });
}

module.exports = {
    send: send
};