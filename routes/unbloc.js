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
                    bloc.splice(i, 1);
                    verif = 1;
                }
            }
            if (verif == 1) {
                db.collection("users").update({login: log}, {$set: {bloc: bloc}}, function(error) {
                    if (error) throw err;
                });
                db.collection("users").find({login: blocked}).toArray(function (error, resu) {
                    if (error) throw error;

                    var by = resu[0].by;
                    for (var i = 0; i < by.length; i++) {
                        if (by[i] == log) {
                            by.splice(i, 1);
                        }
                    }
                    db.collection("users").update({login: blocked}, {$set: {by: by}}, function(error) {
                        if (error) throw err;
                    });
                });
            }
            res.redirect('/profile/' + blocked);
        });
    });
});

module.exports = router;
