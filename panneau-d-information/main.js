var express = require('express');
var app = express();
var server = require('http').createServer(app),
        io = require('socket.io').listen(server),
        ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
        fs = require('fs'),
        session = require('cookie-session'),
        bodyParser = require('body-parser'),
        ChronoMessage = require('./js/ChronoMessage').ChronoMessage,
        Horaire = require('./js/ChronoMessage').Horaire,
        schedule = require('./js/ChronoMessage').schedule,
        datify = require('./js/ChronoMessage').datify,
        sameday = require('./js/ChronoMessage').sameday,
        todayAndAfter = require('./js/ChronoMessage').todayAndAfter,
        expireLaterAnyDay = require('./js/ChronoMessage').expireLaterAnyDay,
        forToday = require('./js/ChronoMessage').forToday,
        noDoublon = require('./js/ChronoMessage').noDoublon,
        printChronoliste = require('./js/ChronoMessage').printChronoliste,
        urlencodedParser = bodyParser.urlencoded({extended: false});

var getLPerm = function (liste) {
    datify(liste);
    var date = new Date();
    return noDoublon(
            liste
            .filter(c => c.date === null || sameday(c.date, date))
            .filter(c => c.fin.getHours() > date.getHours() ||
                        (c.fin.getHours() === date.getHours() &&
                                c.fin.getMinutes() > date.getMinutes())),
            (c1, c2) => (c1.message < c2.message) ? -1 : ((c1.message > c2.message) ? 1 : 0)

    );
};

/*
 * Supprime les doublons d'une liste avant d'être enregistrée dans lperm.
 * La condition d'égalité est tout simplement "tous les attributs égaux."
 * @param {type} liste : La liste dont il faut éliminer les doublons
 * @returns {type} liste : La liste sans doublon.
 */
var delDoublonForLperm = function (liste) {
    return noDoublon(liste,
            (c1, c2) => {
        if (c1.message < c2.message)
            return -1;
        else if (c1.message > c2.message)
            return 1;
        else if (c1.date < c2.date)
            return -1;
        else if (c1.date > c2.date)
            return 1;
        else if (c1.jour < c2.jour)
            return -1;
        else if (c1.jour > c2.jour)
            return 1;
        else if (c1.debut < c2.debut)
            return -1;
        else if (c1.debut > c2.debut)
            return 1;
        else
            return c1.fin - c2.fin;
    });
};

/* Deux messages identiques dans la liste à afficher sont considérés comme 
 * des doublons.
 * @param {type} liste
 * @returns {unresolved}
 */
var delDoublonForToday = function (liste) {
    return noDoublon(
            liste,
            (c1, c2) => (c1.message < c2.message) ? -1 : ((c1.message > c2.message) ? 1 : 0)

    );
};


var getLFutur = function (liste) {
    return noDoublon(liste.filter(c => c.date !== null && c.date > new Date(),
            (c1, c2) => {
        if (c1.message < c2.message)
            return -1;
        else if (c1.message > c2.message)
            return 1;
        else if (c1.date < c2.date)
            return -1;
        else if (c1.date > c2.date)
            return 1;
        else if (c1.jour < c2.jour)
            return -1;
        else if (c1.jour > c2.jour)
            return 1;
        else if (c1.debut < c2.debut)
            return -1;
        else if (c1.debut > c2.debut)
            return 1;
        else
            return c1.fin - c2.fin;
    })
            );
};

var newDayPurge = function () {
    var liste = [];
    fs.readFile('lperm', 'utf8', (err, data) => {
        if (err) {
            console.log("Erreur de lecture du fichier lperm lors de la purge");
        } else {
            try {
                liste = JSON.parse(data);
                fs.readFile('lfutur', 'utf8', (err, data) => {
                    if (err) {
                        console.log("Erreur de lecture du fichier lfutur lors de la purge");
                    } else {
                        try {
                            liste = liste.concat(JSON.parse(data));

                            liste = datify(liste);

                            writeList('lperm',
                                    getLPerm(liste)

                                    );

                            writeList('lfutur',
                                    getLFutur(liste)
                                    );
                        } catch (e) {
                            console.log("Erreur de chargement de la liste dans newDayPurge 1 " + e);
                        }
                    }
                });
            } catch (e) {
                console.log("Erreur de chargement de la liste dans newDayPurge 2" + e);
            }
        }
    });
};

var readFileListAndSendToSocket = function (file = 'lperm', socket) {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.log("Erreur de lecture du fichier " + file);
        } else {
            try {
                list = datify(JSON.parse(data));
                list = todolist.concat(list);
                list = datify(list);
                todolist = cleanListForNow(list);
            } catch (e) {
                console.log("Erreur de chargement de la liste dans " + file + " (" + e + ")");
            }
        }
        socket.broadcast.emit('update', {todolist: todolist});
        socket.emit('update', {todolist: todolist});
    });
};

var nowMessages = function (list) {
    return list
            .filter(c => forToday(c))
            .filter(c => expireLaterAnyDay(c))
            .sort((c1, c2) => c1.debut - c2.debut);
};

var todayMessages = function (list) {
    return list.filter(cm => sameday(cm, new Date()));
};

var delOldMessages = function (list) {
    return list.filter(cm => todayAndAfter(cm));
};

var cleanListForLPerm = function (list) {
    list = delDoublonForLperm(list);
    list = delOldMessages(list);
    return list;
};

var cleanListForNow = function (list) {
    list = delDoublonForToday(list);
    list = nowMessages(list);
    return list;
};

var supMessageFromLPermAndSendToSocket = function (cm, socket) {
    if (cm.date !== null) {
        fs.readFile("lperm", 'utf8', (err, data) => {
            if (err) {
                fs.writeFile("lperm", JSON.stringify(list) + '\n', (err) => {
                    if (err) {
                        console.log("Problème d'écriture dans le fichier lperm");
                    }
                });
            } else {
                try {
                    var list = datify(JSON.parse(data));
                    todolist = list.filter(cmcrt => JSON.stringify(cmcrt) !== JSON.stringify(cm));
                    
                    fs.writeFile("lperm", JSON.stringify(todolist) + '\n', (err) => {
                        if (err) {
                            console.log("Problème d'écriture dans le fichier lperm");
                        }
                    });
                } catch (e) {
                    console.log("Erreur de chargement de la liste dans lperm " + e);
                }
            }

            socket.broadcast.emit('update', {todolist: todolist});
            socket.emit('update', {todolist: todolist});
        });
    }
};

var addListToLPerm = function (list) {
    fs.readFile("lperm", 'utf8', (err, data) => {
        if (err) {
            fs.writeFile("lperm", JSON.stringify(list) + '\n', (err) => {
                if (err) {
                    console.log("Problème d'écriture dans le fichier lperm");
                }
            });
        } else {
            try {
                list = list.concat(JSON.parse(data));
                list = datify(list);
                list = cleanListForLPerm(list);
                fs.writeFile("lperm", JSON.stringify(list) + '\n', (err) => {
                    if (err) {
                        console.log("Problème d'écriture dans le fichier lperm");
                    }
                });
            } catch (e) {
                console.log("Erreur de chargement de la liste dans lperm " + e);
            }
        }
    });
};

var writeList = function (file = 'lperm', list = todolist) {
    fs.writeFile(file, JSON.stringify(list) + '\n', (err) => {
        if (err) {
            console.log("Problème d'écriture dans le fichier lperm");
        }
    });
};


Array.prototype.isEqual = function (b) {
    if (this.length !== b.length)
        return false;
    for (let i in this) {
        if (this[i] !== b[i])
            return false;
    }
    return true;
};


var nettoyageListe = function (socket = null) {
    var date = new Date();
    var tjour = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    var jour = tjour[new Date().getDay()];
    newtodolist = todolist
            .filter(c => expireLaterAnyDay(c))
            .filter(c => ((c.date === null && !c.hasOwnProperty("jour")) ||
                        (c.date === null && (c.hasOwnProperty("jour")
                                && (c.jour === "Tous les jours" || c.jour === jour))) ||
                        (c.date !== null && sameday(c.date, date))))
            .sort((c1, c2) => c1.debut - c2.debut);

    if (socket !== null && !todolist.isEqual(newtodolist)) {
        todolist = newtodolist;
        newtodolist = null;
        socket.broadcast.emit('update', {todolist: todolist});
        socket.emit('update', {todolist: todolist});
        writeList();
}
};

// Chargement de la page index.html
app.use(session({secret: 'todotopsecret'}))

        /* S'il n'y a pas de todolist dans la session,
         on en crée une vide sous forme d'array avant la suite */
        .use(function (req, res, next) {
            if (typeof (req.session.todolist) === 'undefined') {
                req.session.todolist = [];
            }
            next();
        })
        .get('/read', function (req, res) {
            res.sendFile(__dirname + '/read.html');
        })
        .get('/write', function (req, res) {
            res.sendFile(__dirname + '/write.html');
        })
        /* Edition du fichier lfutur */
        .get('/editlfutur', function (req, res) {
            res.sendFile(__dirname + '/editlfutur.html');
        })

        /* Supprime un élément de la todolist */
        .get('/write/supprimer/:id', function (req, res) {
            if (req.params.id !== '') {
                todolist(req.params.id, 1);
                req.socket.emit('update', {todolist: todolist});
                req.socket.broadcast.emit('update', {todolist: todolist});
            }
            res.redirect('/write');
        })
        // Pour pouvoir importer des modules dans les clients.        
        .use('/js', express.static('js'))
        // Pour pouvoir afficher des images.        
        .use('/images', express.static('images'))

        /* On redirige vers la todolist si la page demandée n'est pas trouvée */
        .use(function (req, res, next) {
            res.redirect('/read');
        });

var todolist = [];

io.sockets.on('connection', function (socket) {
// Lancement de la purge tous les jours à 5h05.
    //var date = new Date();
    //date.setHours(5);
    //schedule(date, newDayPurge);
    // newDayPurge();
    setInterval(nettoyageListe, 60 * 1000, socket);

    readFileListAndSendToSocket('lperm', socket);

    // Traitement classique
    socket.on('new', function (message) {
        readFileListAndSendToSocket('lperm', socket);
    });
    // Une tâche a été ajoutée
    socket.on('change_list', function (liste) {
        liste = datify(liste);
        addListToLPerm(liste);
        todolist = todolist.concat(liste);
        todolist = cleanListForNow(todolist);
        readFileListAndSendToSocket('lperm', socket);
    });
    // Supprimer la tâche i
    socket.on('sup_msg', function (i) {
        supMessageFromLPermAndSendToSocket(todolist[i], socket);
    });
});

server.listen(8080);