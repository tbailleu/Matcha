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
    if (req.file == undefined) {
        res.render('info_co.ejs', {info: "Vous n'avez pas choisi de fichier"});
        return false;
    }
    if (req.file.size > 2000000) {
        fs.unlink(req.file.path);
        res.render('info_co.ejs', {info: "Fichier trop lourd"});
        return false;
    }
    if (req.file.mimetype == "image/jpeg") {
        if (req.body.old != "uploads/miss.png") {
            fs.unlink("public/uploads/" + req.session.user.login + "_" + req.body.p + ".jpg", function (err) {
                if (err) {
                    fs.unlink("public/uploads/" + req.session.user.login + "_" + req.body.p + ".png", function (err) {
                        if (err) throw err;
                    });
                }
            });
        }
        fs.rename(req.file.path, "public/uploads/" + req.session.user.login + "_" + req.body.p + ".jpg");
        var pict = "uploads/" + req.session.user.login + "_" + req.body.p + ".jpg";
    }
    else if (req.file.mimetype == "image/png") {
        if (req.body.old != "uploads/miss.png") {
            fs.unlink("public/uploads/" + req.session.user.login + "_" + req.body.p + ".jpg", function (err) {
                if (err) {
                    fs.unlink("public/uploads/" + req.session.user.login + "_" + req.body.p + ".png", function (err) {
                        if (err) throw err;
                    });
                }
            });
        }
        fs.rename(req.file.path, "public/uploads/" + req.session.user.login + "_" + req.body.p + ".png");
        var pict = "uploads/" + req.session.user.login + "_" + req.body.p + ".png";
    }
    else {
        fs.unlink(req.file.path);
        res.render('info_co.ejs', {info: "Mauvais format d'image"});
        return false;
    }

    var log = req.session.user.login;
    mongo.connect("mongodb://localhost/matcha", function(error, db) {
        if (error) throw error;

        db.collection("users").find({login: log}).toArray(function (error, result) {
            if (error) throw error;

            if (req.body.p == "1") {
                db.collection("users").update({login: log}, {$set: {prof_pict: pict}}, function (error, result) {
                    if (error) throw err;

                    res.render('info_co.ejs', {info: "Votre photo a bien été mise à jour"});
                });
            }
            else if (req.body.p == "2") {
                db.collection("users").update({login: log}, {$set: {p2: pict}}, function (error, result) {
                    if (error) throw err;

                    res.render('info_co.ejs', {info: "Votre photo a bien été mise à jour"});
                });
            }
            else if (req.body.p == "3") {
                db.collection("users").update({login: log}, {$set: {p3: pict}}, function (error, result) {
                    if (error) throw err;

                    res.render('info_co.ejs', {info: "Votre photo a bien été mise à jour"});
                });
            }
            else if (req.body.p == "4") {
                db.collection("users").update({login: log}, {$set: {p4: pict}}, function (error, result) {
                    if (error) throw err;

                    res.render('info_co.ejs', {info: "Votre photo a bien été mise à jour"});
                });
            }
            else if (req.body.p == "5") {
                db.collection("users").update({login: log}, {$set: {p5: pict}}, function (error, result) {
                    if (error) throw err;

                    res.render('info_co.ejs', {info: "Votre photo a bien été mise à jour"});
                });
            }
            else {
                res.render('info_co.ejs', {info: "Problème lors du transfert de l'image"});
            }
        });
    });
});

module.exports = router;
