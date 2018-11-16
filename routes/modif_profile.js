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

        db.collection("users").find({login: log}).toArray(function (error, result) {
            if (error) throw error;

            if (result[0].complete == 1) {
                res.render("update.ejs", {nom: result[0].nom, prenom: result[0].prenom, email: result[0].email, sexe: result[0].sexe, pref: result[0].pref, day: result[0].date.day, month: result[0].date.month, year: result[0].date.year, bio: result[0].bio, t1: result[0].tags.t1, t2: result[0].tags.t2, t3: result[0].tags.t3, error: "", lat: result[0].loc.lat, lng: result[0].loc.lng, co: result[0].co});
            }
            else {
                res.render("complete.ejs", {error: ""});
            }
        });
    });
});

module.exports = router;
