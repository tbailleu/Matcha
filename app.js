var express = require('express');
var app = express();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
var session = require('cookie-session');
var favicon = require('serve-favicon');

var seedusers = require('./routes/seedusers');
var login = require('./routes/login');
var reset = require('./routes/reset');
var newuser = require('./routes/newuser');
var activate = require('./routes/activate');
var logout = require('./routes/logout');
var profile = require('./routes/profile');
var modif_profile = require('./routes/modif_profile');
var modif_pict = require('./routes/modif_pict');
var complete = require('./routes/complete');
var update = require('./routes/update');
var upload = require('./routes/upload');
var home = require('./routes/home');
var like = require('./routes/like');
var dislike = require('./routes/dislike');
var notif = require('./routes/notif');
var connect = require('./routes/connect');
var report = require('./routes/report');
var bloc = require('./routes/bloc');
var unbloc = require('./routes/unbloc');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'matchatopsecret'}));
app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(express.static("public"));

var connections = [];
app.set('connections', connections);

app.use(function (req, res, next) {
    if (typeof(req.session.user) == 'undefined') {
        req.session.user = {
            login: "",
            loggedin: false
        };
    }
    next();
});

app.get('/', function (req, res) {
    if (req.session.user.loggedin == true) {
        res.redirect('/home');
    }
    else {
        res.render('login.ejs', {error: ""});
    }
});
app.get('/create', function (req, res) {
    res.render('create.ejs', {error: ""});
});
app.get('/log', function (req, res) {
    res.render('login.ejs', {error: ""});
});
app.get('/forgot', function (req, res) {
    res.render('forgot.ejs', {error: ""});
});

app.use('/login', login);
app.use('/reset', reset);
app.use('/newuser', newuser);
app.use('/activate', activate);
app.use('/logout', logout);
app.use('/profile', profile);
app.use('/modif_profile', modif_profile);
app.use('/modif_pict', modif_pict);
app.use('/complete', complete);
app.use('/update', update);
app.use('/upload', upload);
app.use('/home', home);
app.use('/like', like);
app.use('/dislike', dislike);
app.use('/notif', notif);
app.use('/connect', connect);
app.use('/report', report);
app.use('/bloc', bloc);
app.use('/unbloc', unbloc);
app.use('/seedusers', seedusers);

require ('./routes/socket')(server, connections);

app.use(function (req, res) {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('error.ejs', {err: err});
});

server.listen(8080);
console.log("Server Started");