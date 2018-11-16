var express = require('express');
var router = express.Router();
var mongo = require("mongodb").MongoClient;

router.post('/', function(req, res) {
    if (req.session.user.loggedin != true) {
        res.redirect('/');
        return false;
    }
    var log = req.session.user.login;
    var liked_log = req.body.liked_log;

    mongo.connect("mongodb://localhost/matcha", function (error, db) {
        if (error) throw error;

        db.collection("users").find({login: liked_log}).toArray(function (error, result) {
            if (error) throw error;

            var pop = result[0].pop + 2;
            db.collection("users").update({login: liked_log}, {$set: {pop: pop}}, function (error) {
                if (error) throw err;
            });
        });

        var data = {
            login: liked_log,
            from: log,
            notif: log + " vous like"
        };
        db.collection("notifications").insertOne(data, function (error) {
            if (error) throw error;
        });

        db.collection("likes").find().toArray(function (error, result) {
            if (error) throw error;

            if (!result.length) {
                var data = {
                    log1: log,
                    log2: liked_log,
                    like1: "1",
                    like2: "0"
                };
                db.collection("likes").insertOne(data, function (error) {
                    if (error) throw error;

                    res.redirect("/profile/" + liked_log);
                });
                return true;
            }
            else {
                for (var i in result) {
                    if (result[i].log1 == liked_log || result[i].log2 == liked_log) {
                        if (result[i].log1 == log) {
                            var data = {
                                log1: log,
                                log2: liked_log,
                                like1: "1",
                                like2: result[i].like2
                            };
                            db.collection("likes").updateOne({log1: log, log2: liked_log}, data, function (error) {
                                if (error) throw error;

                                res.redirect("/profile/" + liked_log);
                            });
                            return true;
                        }
                        else if (result[i].log2 == log) {
                            var data = {
                                log1: liked_log,
                                log2: log,
                                like1: result[i].like1,
                                like2: "1"
                            };
                            db.collection("likes").updateOne({log1: liked_log, log2: log}, data, function (error) {
                                if (error) throw error;

                                res.redirect("/profile/" + liked_log);
                            });
                            return true;
                        }
                    }
                }
                var data = {
                    log1: log,
                    log2: liked_log,
                    like1: "1",
                    like2: "0"
                };
                db.collection("likes").insertOne(data, function (error) {
                    if (error) throw error;

                    res.redirect("/profile/" + liked_log);
                });
                return true;
            }
        });
    });
});

module.exports = router;
