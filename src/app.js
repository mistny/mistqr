const express = require('express');
const mongoose = require('mongoose');

require('./db');
const Article = mongoose.model('Article');
const User = mongoose.model('User');
const session = require('express-session');
const path = require('path');
const auth = require('./auth.js');

const app = express();

app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'add session secret here!',
    resave: false,
    saveUninitialized: true,
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

app.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
        res.render("index", {articles: articles});
    });
});

app.get('/article/add', (req, res) => {
    if(!req.session.user) {
        res.redirect('/');
    } else {
        res.render("article-add");
    }
});

app.post('/article/add', (req, res) => {
    if(!req.session.user) {
        res.redirect('/');
    } else {
        new Article({
            title: req.body.title,
            url: req.body.url,
            description: req.body.description,
            userId: req.session.user._id,
        }).save((err) => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/');
            }
        });
    }
});

// come up with a url for /article/slug-name!
app.get('/article/:slug', (req, res) => {
    Article.findOne({slug: req.params.slug}, (err, article) => {
        if (!err) {
            User.findOne({_id: article.userId}, (err, user) => {
                res.render("article-detail", {article: article, user: user});
            });
        }
    });
});

app.get('/register', (req, res) => {
    res.render("register");
});

app.post('/register', (req, res) => {
    auth.register(req.body.username, req.body.email, req.body.password, (err) => {
        res.render("register", {message: err.message});
    }, (user) => {
        auth.startAuthenticatedSession(req, user, () => {
            res.redirect('/');
        } );
    });
});

app.get('/login', (req, res) => {
    res.render("login");
});

app.post('/login', (req, res) => {
    auth.login(req.body.username, req.body.password, (err) => {
        res.render("login", {message: err.message});
    }, (user) => {
        auth.startAuthenticatedSession(req, user, () => {
            res.redirect('/');
        } );
    });
});

app.get('/:user', (req, res) => {
    User.findOne({username: req.params.user}, (err, user) => {
        if (!err) {
            Article.find({userId: user._id}, (err, articles) => {
                res.render("user-articles", {articles: articles});
            });
        }
    });
});

app.listen(3000);
