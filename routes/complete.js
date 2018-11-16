var express = require('express');
var router = express.Router();
var validator = require('validator');
var fs = require('fs');
var mongo = require('mongodb').MongoClient;
var multer = require('multer');
var upload = multer({dest: './public/uploads/'});

router.post('/', upload.single('img'), function(req, res) {
    if (req.session.user.loggedin != true) {
        res.redirect('/');
        return false;
    }
    if (req.body.d == "0" || req.body.m == "0" || req.body.y == "0") {
        res.render('complete.ejs', {error: "Veuillez indiquer votre date de naissance"});
        return false;
    }
    if (req.body.check3 == undefined) {
        res.render('complete.ejs', {error: "Veuillez choisir 3 tags"});
        return false;
    }
    if (req.file == undefined) {
        res.render('complete.ejs', {error: "Veuillez choisir une photo de profil"});
        return false;
    }
    if (req.file.size > 2000000) {
        fs.unlink(req.file.path);
        res.render('complete.ejs', {error: "Fichier trop lourd"});
        return false;
    }
    if (req.file.mimetype == "image/jpeg") {
        fs.rename(req.file.path, "public/uploads/" + req.session.user.login + "_1.jpg");
        var prof_pict = "uploads/" + req.session.user.login + "_1.jpg";
    }
    else if (req.file.mimetype == "image/png") {
        fs.rename(req.file.path, "public/uploads/" + req.session.user.login + "_1.png");
        var prof_pict = "uploads/" + req.session.user.login + "_1.png";
    }
    else {
        fs.unlink(req.file.path);
        res.render('complete.ejs', {error: "Mauvais format d'image"});
        return false;
    }

    var log = req.session.user.login;
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
                nom: result[0].nom,
                prenom: result[0].prenom,
                email: result[0].email,
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
                prof_pict: prof_pict,
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

                res.redirect('/profile');
            });
        });
    });
});

module.exports = router;
