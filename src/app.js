const express = require('express');
const mongoose = require('mongoose');

require(path.join(__dirname, 'db'));
const User = mongoose.model('User');
const ID = mongoose.model('ID');
const session = require('express-session');
const path = require('path');
const auth = require(path.join(__dirname, 'auth.js'));

const app = express();

app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'dummy secret for public repo',
    resave: false,
    saveUninitialized: true,
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.privilege = req.session.user.rank !== 'None';
    next();
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/logout', (req, res) {
    req.session.destroy;
    res.render('index');
});

app.get('/id/:id', (req, res) => {
    if (!req.session.user) {
        res.redirect('https://nymist.com');
    } else if(req.session.user.rank === 'None') {
        res.send('Contact alisaad012@gmail.com to grant you scanning privileges')
    } else {
        ID.findOne({id: req.params.id}, (err, ID) => {
            if (!err) {
                res.render("ID", {ID: ID});
            }
        });
    }
});

app.get('/stats', (req, res) => {
    res.render('index');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    auth.register(req.body.email, req.body.password, (err) => {
        res.render('register', {message: err.message});
    }, (user) => {
        auth.startAuthenticatedSession(req, user, () => {
            res.redirect('/');
        } );
    });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    auth.login(req.body.username, req.body.password, (err) => {
        res.render('login', {message: err.message});
    }, (user) => {
        auth.startAuthenticatedSession(req, user, () => {
            res.redirect('/');
        } );
    });
});

app.listen(3000);
