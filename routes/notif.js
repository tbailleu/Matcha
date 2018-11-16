var express = require('express');
var router = express.Router();
var mongo = require("mongodb").MongoClient;

router.get('/', function(req, res) {
    if (req.session.user.loggedin != true) {
        res.redirect('/');
        return false;
    }
    var log = req.session.user.login;

    mongo.connect("mongodb://localhost/matcha", function (error, db) {
        if (error) throw error;

        db.collection("notifications").find({login: log}).toArray(function (error, result) {
            if (error) throw error;

            if (!result.length) {
                res.render('notif.ejs', {notif: "", info: "Vous n'avez pas de notifications"});
            }
            else {
                db.collection("notifications").remove({login: log}, function (error) {
                    if (error) throw error;

                    res.render('notif.ejs', {notif: result, info: ""});
                });
            }
        });
    });
});

module.exports = router;
