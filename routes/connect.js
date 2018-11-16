var express = require('express');
var router = express.Router();
var mongo = require("mongodb").MongoClient;

router.get('/', function (req, res) {
    if (req.session.user.loggedin != true) {
        res.redirect('/');
        return false;
    }
    var log = req.session.user.login;
    var matchs = [];
    var liked = [];
    var tolike = [];

    mongo.connect("mongodb://localhost/matcha", function (error, db) {
        if (error) throw error;

        db.collection("likes").find().toArray(function (error, result) {
            if (error) throw error;

            if (result.length) {
                for (var i in result) {
                    if (result[i].log1 == log) {
                        if (result[i].like1 == "1" && result[i].like2 == "1") {
                            matchs.push(result[i].log2);
                        }
                        else if (result[i].like1 == "1" && result[i].like2 == "0") {
                            liked.push(result[i].log2);
                        }
                        else if (result[i].like1 == "0" && result[i].like2 == "1") {
                            tolike.push(result[i].log2);
                        }
                    }
                    else if (result[i].log2 == log) {
                        if (result[i].like1 == "1" && result[i].like2 == "1") {
                            matchs.push(result[i].log1);
                        }
                        else if (result[i].like1 == "0" && result[i].like2 == "1") {
                            liked.push(result[i].log1);
                        }
                        else if (result[i].like1 == "1" && result[i].like2 == "0") {
                            tolike.push(result[i].log1);
                        }
                    }
                }
            }
            res.render('connect.ejs', {login: log, matchs: matchs, liked: liked, tolike: tolike});
        });
    });
});

router.get('/:to', function (req, res) {
    if (req.session.user.loggedin != true) {
        res.redirect('/');
        return false;
    }
    var log = req.session.user.login;
    var to = req.params.to;

    mongo.connect("mongodb://localhost/matcha", function (error, db) {
        if (error) throw error;

        db.collection("likes").find().toArray(function (error, result) {
            if (error) throw error;

            if (result.length) {
                for (var i in result) {
                    if ((result[i].log1 == log && result[i].log2 == to) || (result[i].log2 == log && result[i].log1 == to)) {
                        if (result[i].like1 == "1" && result[i].like2 == "1") {
                            db.collection("messages").find({$or : [{from: log, to: to}, {from:to, to: log}]}).toArray(function (error, result) {
                                if (error) throw error;

                                if (result.length) {
                                    res.render('msg.ejs', {from: log, to: to, conv: result});
                                }
                                else {
                                    res.render('msg.ejs', {from: log, to: to, conv: ""});
                                }
                            });
                            return;
                        }
                    }
                }
            }
            res.render('info_co.ejs', {info: "Vous êtes perdu ?"});
        });
    });
});

module.exports = router;
