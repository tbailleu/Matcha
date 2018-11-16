var express = require('express');
var router = express.Router();
var validator = require('validator');
var mongo = require('mongodb').MongoClient;

router.post('/', function(req, res) {
    if (req.session.user.loggedin != true) {
        res.redirect('/');
        return false;
    }
    if (req.body.nom == "" || req.body.prenom == "" || req.body.email == "") {
        res.render('info_co.ejs', {info: "Vous n'avez pas rempli tous les champs, aucune modification n'a été effectuée"});
        return false;
    }
    if (req.body.check3 == undefined) {
        res.render('info_co.ejs', {info: "Problème au niveau des tags, aucune modification n'a été effectuée"});
        return false;
    }
    if (validator.isEmail(req.body.email) == false) {
        res.render('info_co.ejs', {info: "Adresse email invalide, aucune modification n'a été effectuée"});
        return false;
    }

    var log = req.session.user.login;
    var nom = req.body.nom;
    var prenom = req.body.prenom;
    var email = req.body.email;
    var sexe = req.body.sexe;
    var pref = req.body.pref;
    var date = { day: req.body.d, month: req.body.m, year: req.body.y};
    var tags = { t1: req.body.check1, t2: req.body.check2, t3: req.body.check3};
    if (req.body.bio == "") {
        var bio = "Aucune description"
    }
    else {
        var bio = req.body.bio;
    }
    var loc = { lat: req.body.lat, lng: req.body.lng};

    mongo.connect("mongodb://localhost/matcha", function(error, db) {
        if (error) throw error;

        db.collection("users").find({login: log}).toArray(function(error, result) {
            if (error) throw error;

            var data = {
                login: result[0].login,
                nom: nom,
                prenom: prenom,
                email: email,
                password: result[0].password,
                key: result[0].key,
                active: result[0].active,
                complete: "1",
                sexe: sexe,
                pref: pref,
                date: date,
                bio: bio,
                tags: tags,
                loc: loc,
                pop: result[0].pop,
                prof_pict: result[0].prof_pict,
                p2: result[0].p2,
                p3: result[0].p3,
                p4: result[0].p4,
                p5: result[0].p5,
                co: result[0].co,
                token: result[0].token,
                bloc: result[0].bloc,
                by: result[0].by
            };
            db.collection("users").updateOne({login: log}, data, function (error, result) {
                if (error) throw error;

                res.render('info_co.ejs', {info: "Vos modifications ont bien été prises en compte"});
            });
        });
    });
});

module.exports = router;
