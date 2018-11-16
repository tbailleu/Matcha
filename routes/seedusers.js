var express = require('express');
var router = express.Router();
var bcrypt = require ('bcrypt');
var uniqid = require('uniqid');
var mongo = require("mongodb").MongoClient;
var randomname = require('random-name')

router.get('/', function(req, res) {


	var nom = randomname.first();
	var prenom = randomname.last();
	var log = prenom+nom;
	var sexe = (Math.random()>.5?"Homme":"Femme");
	var tags = {
		t1: (Math.random()>.5?"Alice":(Math.random()>.5?"Chapelier fou":(Math.random()>.5?"Chat du Cheshire":"La Chenille"))),
		t2: (Math.random()>.5?"Humpty Dumpty":(Math.random()>.5?"Dodo":(Math.random()>.5?"Lapin blanc":"Lièvre de Mars"))),
		t3: (Math.random()>.5?"Reine de coeur":(Math.random()>.5?"Tweedledum":(Math.random()>.5?"Tweedledee":"Le Temps")))
	}
	var newUser = {
		login: log,
		nom: nom,
		prenom: prenom,
		email: ("email"+parseInt(Math.random()*65000+1).toString()+"@byom.de"),
		password: bcrypt.hashSync(prenom+"12345678", 10),
		key: uniqid(),
		active: "1",
		complete: "1",
		sexe: sexe,
		pref: (Math.random()>.8?"Homme ou femme":(Math.random()>.5?"Homme":"Femme")),
		date: {day: parseInt(Math.random()*27+1).toString(), month: parseInt(Math.random()*10+1).toString(), year: parseInt(Math.random()*69+1930).toString()},
		bio: "Aucune description !!!",
		tags: tags,
		loc: {lat: (Math.random()*7+43).toFixed(6), lgt: (Math.random()*8-2).toFixed(6)},
		pop: 0,
		prof_pict: "uploads/profile-"+(sexe=="Homme"?parseInt(Math.random()*5+1).toString():parseInt(Math.random()*3+5).toString())+".png",
		p2: "uploads/miss.png",
		p3: "uploads/miss.png",
		p4: "uploads/miss.png",
		p5: "uploads/miss.png",
		co: "",
		token: "",
		bloc: [],
		by: [],
	};
	mongo.connect("mongodb://localhost/matcha", function(error, db) {if (error) throw error;
		db.collection("users").find({login: log}).toArray(function(error, result) {if (error) throw error;
			if (!result.length) {
				db.collection("users").insertOne(newUser, function (error, result) {if (error) throw error;
					res.render('info_co.ejs', {info: "Vos modifications ont bien été prises en compte"});
				});
			//                db.collection("users").update({login: log}, {$set: {active: "1"}}, function(error, result) {if (error) throw err;}); 
		    }
		});
	});
});
module.exports = router;
