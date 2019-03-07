'use strict';
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const auth = require(path.join(__dirname, 'auth.js'));
const db = require(path.join(__dirname, 'db'));
const User = mongoose.model('User');
const ID = mongoose.model('ID');
const Umbrella = mongoose.model('Umbrella');
const Event = mongoose.model('Event');
const email = require(path.join(__dirname, 'email.js'));

const app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({mongooseConnection: db.connection})
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.admin = req.session.user && req.session.user.role === 'Admin';
    next();
});

app.get('/', (req, res) => {
    res.render('index', {message: "Scan custom MIST QR codes and track what was scanned."});
});

app.get('/ids', (req, res) => {
    if (req.session.user && req.session.user.role === 'Admin') {
        ID.find({}, (err, ids) => {
            if (err) {
                console.log(err);
            }
            const sortedIDs = ids.sort((a, b) => {
                if (a.id < b.id) {
                    return -1;
                } else if (a.id > b.id) {
                    return 1;
                } else {
                    return 0;
                }
            });
            res.render('ids', {ids: sortedIDs});
        })
    } else {
        res.redirect('/');
    }
});

// TODO:  breakdown by umbrella
// This is for showing ID stats
app.get('/ids/:id', (req, res) => {
    if (req.session.user && req.session.user.role === 'Admin') {
        ID.findOne({id: req.params.id}, (err, id) => {
            if (err) {
                console.log(err);
            }
            res.render('id', {id: id});
        })
    } else {
        res.redirect('/');
    }
});

// TODO:  now defunctt.  see /umbrella/event/id/:id
// This is the one that is scanned
app.get('/id/:id', (req, res) => {
    if (!req.session.user) {
        res.redirect('https://nymist.com');
    } else if(req.session.user.role === 'None') {
        res.send("Contact alisaad012@gmail.com to grant you scanning privileges")
    } else {
        // TODO: Add to a meal and show ✓ or X
        ID.findOne({id: req.params.id}, (err, id) => {
            if (err) {
                console.log(err);
            } else if (id) {
                const time = new Date();
                id.scans.unshift(time);
                id.save((err, id) => {
                    if (err) {
                        console.log(err);
                    }
                });
                Meal.findOne({start: {$lt: time}, end: {$gt: time}}, (err, meal) => {
                    if (meal) {
                        if (meal.scanned.indexOf(req.params.id) === -1) {
                            meal.scanned.push(req.params.id);
                            meal.save((err) => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                            res.render('scanned', {layout: false});
                        } else {
                            res.render('scanned', {layout: false, lastScanned: id.scans[1].toLocaleTimeString()});
                        }
                    } else {
                        res.render('index', {message: "No currently scheduled meals."})
                    }
                });
            } else {
                res.render('id', {message: req.params.id + ": ID Not Found"})
            }
        });
    }
});

// TODO: change to /umbrella/addID
app.get('/addID', (req, res) => {
    if (req.session.user && req.session.user.role === 'Admin') {
        res.render('addID');
    } else {
        res.redirect('/');
    }
});

app.post('/addID', (req, res) => {
    if (req.session.user && req.session.user.role === 'Admin') {
        const ids = req.body.ids.split(/\r?\n|\r/).reduce((acc, curr) => {
            const parts = curr.split(/[\t,]+/);
            if (parts.length === 2) {
                acc.push({
                    id: parts[0].trim(),
                    name: parts[1].trim()
                });
            }
            return acc;
        }, []);
        for (let i = 0; i < ids.length; i++) {
            const curr = ids[i];
            new ID({
                id: curr.id,
                name: curr.name,
                category: req.body.category,
                scans: []
            }).save((err) => {
                if (err) {
                    console.log(err);
                }
            });
            res.redirect('ids');
        }
    } else {
        res.redirect('/');
    }
});

app.get('/meals', (req, res) => {
    if (req.session.user && req.session.user.role === 'Admin') {
        Meal.find({}, (err, meals) => {
            if (err) {
                console.log(err);
            }
            const sortedMeals = meals.sort((a, b) => {
                if (a.start < b.start) {
                    return -1;
                } else if (a.start > b.start) {
                    return 1;
                } else {
                    return 0;
                }
            });
            res.render('meals', {meals: sortedMeals});
        });
    } else {
        res.redirect('/');
    }
});

app.get('/meals/:slug', (req, res) => {
    if (req.session.user && req.session.user.role === 'Admin') {
        Meal.findOne({slug: req.params.slug}, (err, meal) => {
            if (err) {
                console.log(err);
            }
            res.render('meal', {meal: meal});
        });
    } else {
        res.redirect('/');
    }
});

app.post('/meals/:slug', (req, res) => {
    if (req.session.user && req.session.user.role === 'Admin') {
        if (req.params.slug === req.body.remove) {
            Meal.deleteOne({slug: req.params.slug}, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
        res.redirect('/meals');
    } else {
        res.redirect('/');
    }
});

app.get('/addMeal', (req, res) => {
    if (req.session.user && req.session.user.role === 'Admin') {
        res.render('addMeal');
    } else {
        res.redirect('/');
    }
});

app.post('/addMeal', (req, res) => {
    if (req.session.user && req.session.user.role === 'Admin') {
        new Meal({
            name: req.body.name,
            start: new Date(req.body.start),
            end: new Date(req.body.end),
            scanned: []
        }).save((err, meal) => {
            if (err) {
                console.log(err);
            }
            res.redirect('/meals');
        })
    } else {
        res.redirect('/');
    }
});

app.get('/users', (req, res) => {
    if (req.session.user && req.session.user.role === 'Admin') {
        User.find({role: 'None'}, (err, users) => {
            if (err) {
                console.log(err);
            }
            function sortUser (a, b) {
                if (a.email < b.email) {
                    return -1;
                } else if (a.email > b.email) {
                    return 1;
                } else {
                    return 0;
                }
            }
            const sortedUsers = users.sort(sortUser);
            User.find({role: 'Scanner'}, (err, scanners) => {
                if (err) {
                    console.log(err);
                }
                const sortedScanners = scanners.sort(sortUser);
                User.find({role: 'Admin'}, (err, admins) => {
                    if (err) {
                        console.log(err);
                    }
                    const sortedAdmins = admins.sort(sortUser);
                    res.render('users', {users: sortedUsers, scanners: sortedScanners, admins: sortedAdmins});
                });
            });
        });
    } else {
        res.redirect('/');
    }
});

app.post('/users', (req, res) => {
    if (req.session.user && req.session.user.role === 'Admin') {
        console.log(req.body.users);
        req.body.users.forEach((curr) => {
            User.findOneAndUpdate({email: curr}, {$set: {role: 'Scanner'}}, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        });
        res.redirect('/users');
    } else {
        res.redirect('/');
    }
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
    auth.login(req.body.email, req.body.password, (err) => {
        res.render('login', {message: err.message});
    }, (user) => {
        auth.startAuthenticatedSession(req, user, () => {
            res.redirect('/');
        } );
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    });
});

app.use((req, res) => {
    res.status(404).redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
console.log("Now listening on port " + PORT);