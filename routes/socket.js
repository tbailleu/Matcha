module.exports = function (server, connections) {

    var mongo = require("mongodb").MongoClient;
    var io = require('socket.io').listen(server);
    var ent = require ('ent');

    io.sockets.on('connection', function (socket) {
        var user = {};

        socket.on('login', function(token) {
            mongo.connect("mongodb://localhost/matcha", function (error, db) {
                if (error) throw error;

                db.collection("users").findOne({token: token}, function (error, result) {
                    if (error) throw error;

                    if (result) {
                        var verif = 0;
                        user.login = result.login;
                        user.socketId = socket.id;
                        for (var i in connections) {
                            if (connections[i].login == result.login) {
                                connections[i] = user;
                                verif = 1;
                            }
                        }
                        if (verif != 1) {
                            connections.push(user);
                        }
                    }
                });
            });
        });

        socket.on('visit', function(login) {
            for (var i in connections) {
                if (connections[i].login === login) {
                    socket.to(connections[i].socketId).emit('send_notif', "Un utilisateur a visité votre profil");
                }
            }
        });

        socket.on('like', function(login) {
            for (var i in connections) {
                if (connections[i].login === login) {
                    socket.to(connections[i].socketId).emit('send_notif', "Un utilisateur vous like");
                }
            }
        });

        socket.on('dislike', function(login) {
            for (var i in connections) {
                if (connections[i].login === login) {
                    socket.to(connections[i].socketId).emit('send_notif', "Un utilisateur ne vous like plus");
                }
            }
        });

        socket.on('message', function(data) {
            mongo.connect("mongodb://localhost/matcha", function (error, db) {
                if (error) throw error;
                
                db.collection("users").findOne({token: data.token}, function (error, result) {
                    if (error) throw error;

                    if (result) {
                        var from = result.login;
                        var message = data.message;
                        var notif = {
                            login: data.to,
                            from: from,
                            notif: from + " vous a envoyé un message"
                        };
                        var msg_db = {
                            to: data.to,
                            from: from,
                            msg: message
                        };
                        db.collection("messages").insertOne(msg_db, function (error) {
                            if (error) throw error;
                            db.collection("notifications").insertOne(notif, function (error) {
                                if (error) throw error;

                                for (var i in connections) {
                                    if (connections[i].login === data.to) {
                                        socket.to(connections[i].socketId).emit('notif_msg', "Vous avez un nouveau message");
                                        socket.to(connections[i].socketId).emit('put_message', {
                                            message: message,
                                            from: from
                                        });
                                    }
                                }
                            });
                        });
                    }
                });
            });
        });
    });
};
