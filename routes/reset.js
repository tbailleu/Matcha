var express = require('express');
var router = express.Router();
var validator = require('validator');
var bcrypt = require ('bcrypt');
var nodemailer = require('nodemailer');
var mongo = require("mongodb").MongoClient;

function sendEmail(log, key, email) {
    var text = 'Bonjour cher utilisateur, pour réinitialiser votre mot de passe, veuillez cliquer sur le lien suivant : http://localhost:8080/reset/change_pass/' + log + '/' + key;

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'infosmatcha@gmail.com',
            pass: 'matchamatcha'
        }
    });
    mailOptions = {
        from: '"Matcha" <infosmatcha@gmail.com>',
        to: email,
        subject: 'Réinitialisation du mot de passe',
        text: text,
        html: '<p>' + text + '</p>'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
}

router.post('/', function(req, res) {
    if (req.body.login == '' || req.body.email == '') {
        res.render('forgot.ejs', {error: "Veuillez remplir tous les champs"});
        return false;
    }

    var log = req.body.login;
    var email = req.body.email;
    mongo.connect("mongodb://localhost/matcha", function(error, db) {
        if (error) throw error;

        db.collection("users").find({login: log}).toArray(function (error, result) {
            if (error) throw error;

            if (!result.length) {
                res.render('forgot.ejs', {error: "Utilisateur introuvable"});
            }
            else if (result[0].email != email) {
                res.render('forgot.ejs', {error: "Mauvaise adresse mail"});
            }
            else {
                sendEmail(log, result[0].key, email);
                res.render('info.ejs', {info: "Un mail de réinitialisation vous a été envoyé"});
            }
        });
    });
});

router.get('/change_pass/:log/:key', function(req, res) {
    if (req.params.log == '' || req.params.key == '') {
        res.render('info.ejs', {info: 'Vous êtes perdus ?'});
    }
    var log = req.params.log;
    var key = req.params.key;

    mongo.connect("mongodb://localhost/matcha", function(error, db) {
        if (error) throw error;

        db.collection("users").find({login: log}).toArray(function (error, result) {
            if (error) throw error;

            if (!result.length || result[0].key != key) {
                res.render('info.ejs', {info: "Vous êtes perdus ?"});
            }
            else {
                res.render('change_pass.ejs', {error: "", log: log, key: key});
            }
        });
    });
});

router.post('/confirm', function(req, res) {
    var log = req.body.log;
    var key = req.body.key;
    var pass = req.body.passwd;
    var pass2 = req.body.passwd2;

    if (pass == '' || pass2 == '') {
        res.render('change_pass.ejs', {error: "Veuillez remplir tous les champs", log: log, key:key});
    }
    else if (validator.isLength(pass, {min:8}) == false) {
        res.render('change_pass.ejs', {error: "Le mot de passe est trop court", log: log, key:key});
    }
    else if (validator.equals(pass, pass2) == false) {
        res.render('change_pass.ejs', {error: "Les mots de passe ne sont pas identiques", log: log, key:key});
    }
    else {
        var hash = bcrypt.hashSync(pass, 10);
        mongo.connect("mongodb://localhost/matcha", function (error, db) {
            if (error) throw error;

            db.collection("users").update({login: log}, {$set: {password: hash}}, function(error, result) {
                if (error) throw err;

                res.render('info.ejs', {info: "Votre mot de passe a bien été modifié"});
            });
        });
    }
});

module.exports = router;
