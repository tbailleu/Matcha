var express = require('express');
var router = express.Router();
var mongo = require("mongodb").MongoClient;

router.get('/', function(req, res) {
    var connections = req.app.get('connections');
    var log = req.session.user.login;
    req.session.user = {
        login: "",
        loggedin: false
    };
    var today = new Date();
    var date = today.getDate() + "/" + today.getMonth() + "/" + today.getFullYear();

    mongo.connect("mongodb://localhost/matcha", function(error, db) {
        if (error) throw error;
        db.collection("users").update({login: log}, {$set: {co: date}}, function (error, result) {
            if (error) throw err;

            db.collection("users").update({login: log}, {$set: {token: ""}}, function (error, result) {
                if (error) throw err;

                for (var i in connections) {
                    if (connections[i].login === log) {
                        connections.splice(i, 1);
                    }
                }
                res.redirect('/');
            });
        });
    });
});

module.exports = router;
