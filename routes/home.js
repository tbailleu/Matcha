var express = require('express');
var router = express.Router();
var mongo = require("mongodb").MongoClient;
var geolib = require('geolib');

function calc_age(date) {
    today_date = new Date();
    today_year = today_date.getFullYear();
    today_month = today_date.getMonth();
    today_day = today_date.getDate();
    age = today_year - date.year;

    if (today_month < (date.month - 1)) {
        age--;
    }
    if (((date.month - 1) == today_month) && (today_day < date.day)) {
        age--;
    }

    return age;
}

router.get('/', function (req, res) {
    if (req.session.user.loggedin != true) {
        res.redirect('/');
        return false;
    }
    var log = req.session.user.login;

    mongo.connect("mongodb://localhost/matcha", function (error, db) {
        if (error) throw error;

        db.collection("users").find({login: log}).toArray(function (error, result) {
            if (error) throw error;

            if (result[0].complete != 1) {
                res.redirect("/profile");
            }
            else {
                var age = calc_age(result[0].date);
                var user = {
                    login: result[0].login,
                    sexe: result[0].sexe,
                    pref: result[0].pref,
                    age: age,
                    t1: result[0].tags.t1,
                    t2: result[0].tags.t2,
                    t3: result[0].tags.t3,
                    lat: result[0].loc.lat,
                    lng: result[0].loc.lng,
                    pop: result[0].pop
                };
                db.collection("users").find().toArray(function (error, resu) {
                    if (error) throw error;

                    for (var i = 0; resu[i]; i++) {
                        var by = resu[i].by;
                        var verif = 0;
                        if (by) {
                            for (var j = 0; j < by.length; j++) {
                                if (by[j] == log) {
                                    verif = 1;
                                }
                            }
                        }
                        if (user.login == resu[i].login) {
                            resu.splice(i, 1);
                            i--;
                        }
                        else if (resu[i].complete != "1") {
                            resu.splice(i, 1);
                            i--;
                        }
                        else if (verif == 1) {
                            resu.splice(i, 1);
                            i--;
                        }
                        else if (user.sexe != resu[i].pref && resu[i].pref != "Homme ou femme") {
                            resu.splice(i, 1);
                            i--;
                        }
                        else if (user.pref != resu[i].sexe && user.pref != "Homme ou femme") {
                            resu.splice(i, 1);
                            i--;
                        }
                    }
                    var people = [];
                    for (var i = 0; resu[i]; i++) {
                        var tag = 0;
                        if (user.t1 == resu[i].tags.t1 || user.t1 == resu[i].tags.t2 || user.t1 == resu[i].tags.t3) {
                            tag++;
                        }
                        if (user.t2 == resu[i].tags.t1 || user.t2 == resu[i].tags.t2 || user.t2 == resu[i].tags.t3) {
                            tag++;
                        }
                        if (user.t3 == resu[i].tags.t1 || user.t3 == resu[i].tags.t2 || user.t3 == resu[i].tags.t3) {
                            tag++;
                        }
                        var dist = geolib.getDistance({
                            latitude: isNaN(parseFloat(user.lat))?0:parseFloat(user.lat),
							longitude: isNaN(parseFloat(user.lng))?0:parseFloat(user.lng)
                        }, {
                            latitude: isNaN(parseFloat(resu[i].loc.lat))?0:parseFloat(resu[i].loc.lat),
							longitude: isNaN(parseFloat(resu[i].loc.lng))?0:parseFloat(resu[i].loc.lng)});
                        dist = (dist / 1000).toFixed(1);
                        var peop = {
                            login: resu[i].login,
                            sexe: resu[i].sexe,
                            pref: resu[i].pref,
                            prof_pict: resu[i].prof_pict,
                            age: calc_age(resu[i].date),
                            t1: resu[i].tags.t1,
                            t2: resu[i].tags.t2,
                            t3: resu[i].tags.t3,
                            tag: tag,
                            dist: dist,
                            pop: resu[i].pop
                        };
                        people.push(peop);
                    }
                    people.sort(function (a, b) {
                        return a.dist - b.dist;
                    });
                    res.render('home.ejs', {people: people, tri: "loc"});
                });
            }
        });
    });
});

router.post('/', function (req, res) {
    var log = req.session.user.login;
    var tri = "none";
    var min_age = "none";
    var max_age = "none";
    var max_dist = "none";
    var min_tag = "none";
    if (req.body.tri != undefined) {
        tri = req.body.tri;
    }
    if (req.body.age != undefined) {
        if (req.body.age == "18") {
            min_age = "18";
            max_age = "25";
        }
        else if (req.body.age == "26") {
            min_age = "26";
            max_age = "35";
        }
        else if (req.body.age == "36") {
            min_age = "36";
            max_age = "45";
        }
        else if (req.body.age == "46") {
            min_age = "46";
            max_age = "55";
        }
        else if (req.body.age == "56") {
            min_age = "56";
        }
    }
    if (req.body.loc != undefined) {
        max_dist = req.body.loc;
    }
    if (req.body.tag != undefined) {
        min_tag = req.body.tag;
    }

    mongo.connect("mongodb://localhost/matcha", function (error, db) {
        if (error) throw error;

        db.collection("users").find({login: log}).toArray(function (error, result) {
            if (error) throw error;

            var user = {
                login: result[0].login,
                sexe: result[0].sexe,
                pref: result[0].pref,
                age: calc_age(result[0].date),
                t1: result[0].tags.t1,
                t2: result[0].tags.t2,
                t3: result[0].tags.t3,
                lat: result[0].loc.lat,
                lng: result[0].loc.lng,
                pop: result[0].pop
            };
            db.collection("users").find().toArray(function (error, resu) {
                if (error) throw error;

                for (var i = 0; resu[i]; i++) {
                    var by = resu[i].by;
                    var verif = 0;
                    if (by) {
                        for (var j = 0; j < by.length; j++) {
                            if (by[j] == log) {
                                verif = 1;
                            }
                        }
                    }
                    if (resu[i].complete != "1") {
                        resu.splice(i, 1);
                        i--;
                    }
                    else if (verif == 1) {
                        resu.splice(i, 1);
                        i--;
                    }
                    else {
                        var age = calc_age(resu[i].date);
                        var tag = 0;
                        if (user.t1 == resu[i].tags.t1 || user.t1 == resu[i].tags.t2 || user.t1 == resu[i].tags.t3) {
                            tag++;
                        }
                        if (user.t2 == resu[i].tags.t1 || user.t2 == resu[i].tags.t2 || user.t2 == resu[i].tags.t3) {
                            tag++;
                        }
                        if (user.t3 == resu[i].tags.t1 || user.t3 == resu[i].tags.t2 || user.t3 == resu[i].tags.t3) {
                            tag++;
                        }
                        var dist = geolib.getDistance({
                            latitude: isNaN(parseFloat(user.lat))?0:parseFloat(user.lat),
							longitude: isNaN(parseFloat(user.lng))?0:parseFloat(user.lng)
                        }, {
                           latitude: isNaN(parseFloat(resu[i].loc.lat))?0:parseFloat(resu[i].loc.lat),
						   longitude: isNaN(parseFloat(resu[i].loc.lng))?0:parseFloat(resu[i].loc.lng)});
                        if (user.login == resu[i].login) {
                            resu.splice(i, 1);
                            i--;
                        }
                        else if (user.sexe != resu[i].pref && resu[i].pref != "Homme ou femme") {
                            resu.splice(i, 1);
                            i--;
                        }
                        else if (user.pref != resu[i].sexe && user.pref != "Homme ou femme") {
                            resu.splice(i, 1);
                            i--;
                        }
                        else if (min_age != "none" && age < min_age) {
                            resu.splice(i, 1);
                            i--;
                        }
                        else if (max_age != "none" && age > max_age) {
                            resu.splice(i, 1);
                            i--;
                        }
                        else if (max_dist != "none" && dist > max_dist) {
                            resu.splice(i, 1);
                            i--;
                        }
                        else if (min_tag != "none" && tag < min_tag) {
                            resu.splice(i, 1);
                            i--;
                        }
                    }
                }
                var people = [];
                for (var i = 0; resu[i]; i++) {
                    var age = calc_age(resu[i].date);
                    var tag = 0;
                    if (user.t1 == resu[i].tags.t1 || user.t1 == resu[i].tags.t2 || user.t1 == resu[i].tags.t3) {
                        tag++;
                    }
                    if (user.t2 == resu[i].tags.t1 || user.t2 == resu[i].tags.t2 || user.t2 == resu[i].tags.t3) {
                        tag++;
                    }
                    if (user.t3 == resu[i].tags.t1 || user.t3 == resu[i].tags.t2 || user.t3 == resu[i].tags.t3) {
                        tag++;
                    }
                    var dist = geolib.getDistance({
                        latitude: isNaN(parseFloat(user.lat))?0:parseFloat(user.lat),
						longitude: isNaN(parseFloat(user.lng))?0:parseFloat(user.lng)
                    }, {
                        latitude: isNaN(parseFloat(resu[i].loc.lat))?0:parseFloat(resu[i].loc.lat),
						longitude: isNaN(parseFloat(resu[i].loc.lng))?0:parseFloat(resu[i].loc.lng)});
                    dist = (dist / 1000).toFixed(1);
                    var peop = {
                        login: resu[i].login,
                        sexe: resu[i].sexe,
                        pref: resu[i].pref,
                        prof_pict: resu[i].prof_pict,
                        age: age,
                        t1: resu[i].tags.t1,
                        t2: resu[i].tags.t2,
                        t3: resu[i].tags.t3,
                        tag: tag,
                        dist: dist,
                        pop: resu[i].pop
                    };
                    people.push(peop);
                }
                if (tri == "age") {
                    people.sort(function (a, b) {
                        return a.age - b.age;
                    });
                }
                else if (tri == "revage") {
                    people.sort(function (a, b) {
                        return a.age - b.age;
                    });
                    people.reverse();
                }
                else if (tri == "pop") {
                    people.sort(function (a, b) {
                        return a.pop - b.pop;
                    });
                    people.reverse();
                }
                else if (tri == "tag") {
                    people.sort(function (a, b) {
                        return a.tag - b.tag;
                    });
                    people.reverse();
                }
                else {
                    people.sort(function (a, b) {
                        return a.dist - b.dist;
                    });
                }
                res.render('home.ejs', {people: people, tri: tri});
            });
        });
    });
});

module.exports = router;
