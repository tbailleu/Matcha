var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var uniqid = require('uniqid');
var mongo = require("mongodb").MongoClient;

router.post('/', function (req, res) {
    if (req.body.login === '' || req.body.passwd === '') {
        res.render('login.ejs', {error: "Veuillez remplir tous les champs"});
        return false;
    }
    var log = req.body.login;
    var pass = req.body.passwd;

    mongo.connect("mongodb://localhost/matcha", function (error, db) {
        if (error) throw error;

        db.collection("users").find({login: log}).toArray(function (error, result) {
            if (error) throw error;

            if (!result.length) {
                res.render('login.ejs', {error: "Identifiant inconnu"});
            }
            else if (bcrypt.compareSync(pass, result[0].password) == false) {
                res.render('login.ejs', {error: "Mot de passe incorrect"});
            }
            else if (result[0].active != 1) {
                res.render('login.ejs', {error: "Ce compte n'est pas activé"});
            }
            else {
                req.session.user = {
                    login: log,
                    loggedin: true
                };
                var token = uniqid();
                db.collection("users").update({login: log}, {$set: {co: "1"}}, function (error, resu) {
                    if (error) throw error;

                    db.collection("users").update({login: log}, {$set: {token: token}}, function (error, resu) {
                        if (error) throw error;

                        db.collection("notifications").find({login: log}).toArray(function (error, resul) {
                            if (error) throw error;

                            if (resul.length) {
                                res.render('redir.ejs', {token: token, not: "1"});
                            }
                            else {
                                res.render('redir.ejs', {token: token, not: "0"});
                            }
                        });

                    });
                });
            }
        });
    });

});

module.exports = router;
