var express = require('express');
var router = express.Router();
var mongo = require("mongodb").MongoClient;
var nodemailer = require('nodemailer');

function sendEmail(log, reported) {
    var text = log + ' vient de signaler ' + reported;

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'infosmatcha@gmail.com',
            pass: 'matchamatcha'
        }
    });
    mailOptions = {
        from: '"Matcha" <infosmatcha@gmail.com>',
        to: 'infosmatcha@gmail.com',
        subject: 'Utilisateur signalé',
        text: text,
        html: '<p>' + text + '</p>'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
}

router.get('/:log', function (req, res) {
    if (req.session.user.loggedin != true) {
        res.redirect('/');
        return false;
    }
    var log = req.session.user.login;
    var reported = req.params.log;

    sendEmail(log, reported);
    res.render('info_co.ejs', {info: "L'utilisateur a bien été signalé. Attention, tout abus sera puni."});
});

module.exports = router;
