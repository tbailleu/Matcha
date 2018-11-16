var express = require('express');
var http = require('http');
var router = express.Router();
var mongo = require("mongodb").MongoClient;

getJSON = function(options, onResult)
{
    var prot = options.port == 443 ? https : http;
    var req = prot.request(options, function(res)
    {
        var output = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = JSON.parse(output);
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
        onResult(0, {});
    });

    req.end();
};

function calc_age(date) {
    today_date = new Date();
    today_year = today_date.getFullYear();
    today_month = today_date.getMonth();
    today_day = today_date.getDate();
    age = today_year - date.year;

    if ( today_month < (date.month - 1))
    {
        age--;
    }
    if (((date.month - 1) == today_month) && (today_day < date.day))
    {
        age--;
    }

    return age;
}

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

            if (result[0].date.day != "") {
                var age = calc_age(result[0].date);
            }
            else {
                var age = "";
            }

            if (result[0].complete == 1) {
                var options = {
                    host: 'maps.googleapis.com',
                    path: '/maps/api/geocode/json?latlng=' + result[0].loc.lat + ',' + result[0].loc.lng + '&sensor=true',
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                getJSON(options, function (statusCode, resu) {
                    res.render("myprofile.ejs", {
                        res: result[0],
                        age: age,
                        city: ""//resu.results[0].address_components[2].long_name
                    });
                });
            }
            else {
                res.render("myprofile.ejs", {
                    res: result[0],
                    age: age,
                    city: ""
                });
            }
        });
		//db.dropCollection("users");
    });
});

router.get('/:log', function(req, res) {
    var log = req.params.log;
    var logued = req.session.user.login;
    if (log == logued) {
        res.redirect("/profile");
        return false;
    }

    mongo.connect("mongodb://localhost/matcha", function (error, db) {
        if (error) throw error;

        db.collection("users").find({login: log}, {_id:0, password:0, email:0, key:0, token:0}).toArray(function (error, result) {
            if (error) throw error;

            if (!result.length) {
                res.render('info_co.ejs', {info: "Vous êtes perdu ?"});
                return;
            }
            var by = result[0].by;
            if (by) {
                for (var i = 0; i < by.length; i++) {
                    if (by[i] == logued) {
                        res.render('unblock.ejs', {login: logued, blocked: log});
                        return;
                    }
                }
            }
            var bloc = result[0].bloc;
            if (bloc) {
                for (var i = 0; i < bloc.length; i++) {
                    if (bloc[i] == logued) {
                        res.render('info_co.ejs', {info: "Cet utilisateur vous a bloqué"});
                        return;
                    }
                }
            }
            if (result[0].date.day != "") {
                var age = calc_age(result[0].date);
            }
            else {
                var age = "";
            }

            var like = "0";
            db.collection("likes").find().toArray(function (error, resu) {
                if (error) throw error;

                if (resu.length) {
                    for (var i in resu) {
                        if (resu[i].log1 == log || resu[i].log2 == log) {
                            if (resu[i].log1 == logued) {
                                if (resu[i].like1 == "1" && resu[i].like2 == "1") {
                                    like = "3";
                                }
                                else if (resu[i].like1 == "0" && resu[i].like2 == "1") {
                                    like = "2";
                                }
                                else if (resu[i].like1 == "1" && resu[i].like2 == "0") {
                                    like = "1";
                                }
                            }
                            else if (resu[i].log2 == logued) {
                                if (resu[i].like2 == "1" && resu[i].like1 == "1") {
                                    like = "3";
                                }
                                else if (resu[i].like1 == "1" && resu[i].like2 == "0") {
                                    like = "2";
                                }
                                else if (resu[i].like1 == "0" && resu[i].like2 == "1") {
                                    like = "1";
                                }
                            }
                        }
                    }
                }
            });

            var pop = result[0].pop + 1;
            db.collection("users").update({login: log}, {$set: {pop: pop}}, function(error) {
                if (error) throw err;
            });

            var data = {
                login: log,
                from: logued,
                notif: logued + " a visité votre profil le " + new Date().getDate() + "/" + (new Date().getMonth() + 1)
            };
            db.collection("notifications").find({notif: data.notif, login: log}).toArray(function (error, resu) {
                if (error) throw error;

                if (!resu.length) {
                    db.collection("notifications").insertOne(data, function (error) {
                        if (error) throw error;
                    });
                }
            });

            var options = {
                host: 'maps.googleapis.com',
                path: '/maps/api/geocode/json?latlng=' + result[0].loc.lat + ',' + result[0].loc.lng + '&sensor=true',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            getJSON(options, function (statusCode, resu) {
                res.render("profile.ejs", {
                    res: result[0],
                    age: age,
                    city: "",//resu.results[0].address_components[2].long_name,
                    love: like
                });
            });
        });
    });
});

module.exports = router;
