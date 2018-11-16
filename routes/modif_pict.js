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

            var pict = {
                p1: result[0].prof_pict,
                p2: result[0].p2,
                p3: result[0].p3,
                p4: result[0].p4,
                p5: result[0].p5
            };
            res.render('modif_pict.ejs', {pict: pict});
        });
    });
});

module.exports = router;
