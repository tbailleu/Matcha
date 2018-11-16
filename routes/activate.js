var express = require('express');
var router = express.Router();
var mongo = require("mongodb").MongoClient;

router.get('/:log/:key', function(req, res) {
    if (req.params.log == '' || req.params.key == '') {
        res.render('info.ejs', {info: 'Vous êtes perdus ?'});
    }
    var log = req.params.log;
    var key = req.params.key;

    mongo.connect("mongodb://localhost/matcha", function(error, db) {
        if (error) throw error;

        db.collection("users").find({login: log}).toArray(function (error, result) {
            if (error) throw error;

            if (!result.length || result[0].key != key) {
                res.render('info.ejs', {info: "Vous êtes perdus ?"});
            }
            else {
                db.collection("users").update({login: log}, {$set: {active: "1"}}, function(error, result) {
                    if (error) throw err;

                    res.render('info.ejs', {info: "Votre compte a bien été activé"});
                });
            }
        });
    });
});

module.exports = router;
