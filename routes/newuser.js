var express = require('express');
var router = express.Router();
var validator = require('validator');
var bcrypt = require ('bcrypt');
var nodemailer = require('nodemailer');
var uniqid = require('uniqid');
var mongo = require("mongodb").MongoClient;

function sendEmail(log, key, email) {
    var text = 'Bonjour et bienvenue sur Matcha, pour profiter des fonctionnalités du site, veuillez cliquer sur le lien suivant afin d\'activer votre compte : http://localhost:8080/activate/' + log + '/' + key;

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
        subject: 'Inscription à Matcha',
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
    if (req.body.login == '' || req.body.nom == '' || req.body.prenom == '' || req.body.email == '' || req.body.passwd == '' || req.body.passwd2 == '') {
        res.render('create.ejs', {error: "Veuillez remplir tous les champs"});
        return false;
    }

    var log = req.body.login;
    if(!log.match(/^[0-9A-Za-z]+$/)) {
        res.render('create.ejs', {error: "Le pseudo ne peut contenir que des lettres et des chiffres"});
        return false;
    }

    var nom = req.body.nom;
    var prenom = req.body.prenom;
    var email = req.body.email;
    var pass = req.body.passwd;
    var pass2 = req.body.passwd2;
    var key = uniqid();
    var hash = bcrypt.hashSync(pass, 10);
    var newUser = {
        login: log,
        nom: nom,
        prenom: prenom,
        email: email,
        password: hash,
        key: key,
        active: "0",
        complete: "",
        sexe: "",
        pref: "",
        date: {day: "", month: "", year: ""},
        bio: "",
        tags: {t1: "", t2: "", t3: ""},
        loc: {lat: "", lgt: ""},
        pop: 0,
        prof_pict: "uploads/miss.png",
        p2: "uploads/miss.png",
        p3: "uploads/miss.png",
        p4: "uploads/miss.png",
        p5: "uploads/miss.png",
        co: "",
        token: "",
        bloc: [],
        by: []
    };

    mongo.connect("mongodb://localhost/matcha", function(error, db) {
        if (error) throw error;

        db.collection("users").find({login: log}).toArray(function(error, result) {
            if (error) throw error;

            if (result.length) {
                res.render('create.ejs', {error: "Identifiant déjà existant"});
            }
            else if (validator.isLength(pass, {min:8}) == false) {
                res.render('create.ejs', {error: "Le mot de passe est trop court"});
            }
            else if (validator.equals(pass, pass2) == false) {
                res.render('create.ejs', {error: "Les mots de passe ne sont pas identiques"});
            }
            else if (validator.isEmail(email) == false) {
                res.render('create.ejs', {error: "Adresse email invalide"});
            }
            else {
                db.collection("users").insertOne(newUser, function (error, result) {
                    if (error) throw error;

                    sendEmail(log, key, email);
                    res.render('info.ejs', {info: "Un mail de confirmation vous a été envoyé"});
                });
            }
        });
    });
});

module.exports = router;
