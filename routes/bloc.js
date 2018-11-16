var express = require('express');
var router = express.Router();
var mongo = require("mongodb").MongoClient;

router.get('/:log', function (req, res) {
    if (req.session.user.loggedin != true) {
        res.redirect('/');
        return false;
    }
    var log = req.session.user.login;
    var blocked = req.params.log;

    mongo.connect("mongodb://localhost/matcha", function (error, db) {
        if (error) throw error;

        db.collection("users").find({login: log}).toArray(function (error, result) {
            if (error) throw error;

            var verif = 0;
            var bloc = result[0].bloc;
            for (var i = 0; i < bloc.length; i++) {
                if (bloc[i] == blocked) {
                    verif = 1;
                }
            }
            if (verif == 0) {
                bloc.push(blocked);
                db.collection("users").update({login: log}, {$set: {bloc: bloc}}, function(error) {
                    if (error) throw error;
                });
                db.collection("users").find({login: blocked}).toArray(function (error, resu) {
                    if (error) throw error;

                    var by = resu[0].by;
                    by.push(log);
                    db.collection("users").update({login: blocked}, {$set: {by: by}}, function(error) {
                        if (error) throw error;
                    });
                });
                db.collection("likes").find().toArray(function (error, resu) {
                    if (error) throw error;

                    if (result.length) {
                        for (var i in resu) {
                            if (resu[i].log1 == log) {
                                if (resu[i].log2 == blocked) {
                                    var id = resu[i]._id;
                                    db.collection("likes").remove({_id: id}, function(error) {
                                        if (error) throw error;
                                    });
                                }
                            }
                            else if (resu[i].log2 == log) {
                                if (resu[i].log1 == blocked) {
                                    var id = resu[i]._id;
                                    db.collection("likes").remove({_id: id}, function(error) {
                                        if (error) throw error;
                                    });
                                }
                            }
                        }
                    }
                });
            }
            res.redirect('/profile/' + blocked);
        });
    });
});

module.exports = router;
