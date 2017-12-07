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
        noDoublon = require('./js/ChronoMessage').noDoublon,
        printChronoliste = require('./js/ChronoMessage').printChronoliste,
        urlencodedParser = bodyParser.urlencoded({extended: false});

var getLPerm = function(liste) {
    return noDoublon(
                                liste.filter(c => c.date === null || sameday(c.date, new Date())), 
                                (c1, c2) => (c1.message < c2.message) ? -1 : ((c1.message > c2.message) ? 1 : 0)
                            );
};

var getLFutur = function(liste) {
    return noDoublon(
                                liste.filter(c => c.date !== null && c.date > new Date()),
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
                                        return c1.fin - c2.fin ;
                                }      
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
                            var s = new Set(JSON.parse(data));
                            s.append(liste);
                            liste = s.toArray();
                                             
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

Set.prototype.append = function (s) {
    for (let e of s) {
        this.add(e);
    }
};

Set.prototype.toArray = function () {
    var r = [];
    for (let e of this) {
        r.push(e);
    }
    return r;
};

var readLperm = function () {
    fs.readFile('lperm', 'utf8', (err, data) => {
        if (err) {
            console.log("Erreur de lecture du fichier lperm");
        } else {
            try {
                todolist = JSON.parse(data);
                todolist = datify(todolist);
                nettoyageListe();
            } catch (e) {
                console.log("Erreur de chargement de la liste dans readLperm" + e);
            }
        }
    });
};

var readLfutur = function () {
    fs.readFile('lfutur', 'utf8', (err, data) => {
        if (err) {
            console.log("Erreur de lecture du fichier lfutur");
        } else {
            try {
                futurlist = JSON.parse(data);
                futurlist = datify(futurlist);
            } catch (e) {
                console.log("Erreur de chargement de la liste dans readLfutur " + e);
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

var writeFuturList = function (newlist) {
    fs.readFile('lfutur', 'utf8', (err, data) => {
        if (err) {
            fs.writeFile('lfutur', JSON.stringify(newlist) + '\n', (err) => {
                if (err) {
                    console.log("Problème d'écriture dans le fichier lfutur");
                }
            });
        } else {
            try {
                futurlist = JSON.parse(data);
                let s = new Set(futurlist);
                s.append(newlist);

                fs.writeFile('lfutur', JSON.stringify(s.toArray()) + '\n', (err) => {
                    if (err) {
                        console.log("Problème d'écriture dans le fichier lfutur");
                    }
                });
            } catch (e) {
                console.log("Erreur de chargement de la liste dans writeFuturList " + e);
            }
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
            .filter(c => {
                try {
                    return date < c.fin;
                } catch (e) {
                    return true;
                }
            })
            .filter(c => ((c.date === null && !c.hasOwnProperty("jour")) ||
                        (c.date === null && (c.hasOwnProperty("jour")
                                && (c.jour === "Tous les jours" || c.jour === jour))) ||
                        (c.date !== null && sameday(c.date, date))))
            .sort((c1, c2) => c1 - c2
            );

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
var futurlist = [];

io.sockets.on('connection', function (socket) {

// Lancement de la purge tous les jours à 5h05.
    var date = new Date();
    date.getHours(5);
    // #### à remettre schedule(date, newDayPurge);
    newDayPurge();
    setInterval(nettoyageListe, 60 * 60 * 1000, socket);
    readLfutur();

    // Edition de lfutur
    socket.on('neweditlfutur', function (message) {
        socket.emit('updateeditlfutur', {todolist: futurlist});
    });
    // Supprimer la tâche i
    socket.on('sup_msglfutur', function (i) {
        futurlist.splice(i, 1);
        writeList('lfutur', futurlist);
        socket.emit('updateeditlfutur', {todolist: futurlist});
    });


    // Une tâche a été ajoutée
    socket.on('change_listlfutur', function (liste) {

        futurlist = liste;
        writeList('lfutur', futurlist);
        socket.emit('updateeditlfutur', {todolist: futurlist});
    });

    readLperm();

    // Traitement classique
    socket.on('new', function (message) {
        socket.broadcast.emit('update', {todolist: todolist});
        socket.emit('update', {todolist: todolist});
    });
    // Une tâche a été ajoutée
    socket.on('change_list', function (liste) {
        var tjour = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
        var jour = tjour[new Date().getDay()];
        var date = new Date();
        liste = datify(liste);
        // La liste est filtrée et triée puis rangée dans newtodolist
        // Sont conservés pour "aujourd'hui", les messages :
        //    - sans date et sans jour
        //    - sans date et dont le jour est aujourd'hui ou tous les jours
        //    - avec date et la date est aujourd'hui
        var newtodolist = liste
                .filter(c => {
                   
                    return ((c.date === null && !c.hasOwnProperty("jour")) ||
                            (c.date === null && (c.hasOwnProperty("jour") && 
                            (c.jour === "Tous les jours" || c.jour === jour))) ||
                            (c.date !== null && sameday(c.date, date)));
                })
                .sort(function (c1, c2) {
                    return c1.debut - c2.debut;
                });
        // Les nouveaux éléments de la liste.
        // Indique les événements à générer pour supprimer les nouveaux messages.
        newtodolist.forEach(a => {
            var i = 0;
            while (i < todolist.length && (todolist[i].message !== a.message)) {
                ++i;
            }
            if (i === todolist.length || (i < todolist.length && todolist[i].fin !== a.fin)) {
                schedule(a.fin, nettoyageListe, 1, false, socket);
            }
        });
        console.log("------- todolist avant getLPerm ----------");
        for (let xxx of todolist) {
            console.log(" --> " + xxx);
        }

        todolist = getLPerm(newtodolist);
        
        console.log("------- todolist après getLPerm ----------");
        for (let xxx of todolist) {
            console.log(" --> " + xxx);
        }


        writeList();
        writeFuturList(getLFutur(liste.filter(c =>
            (c.date !== null && c.date > date) ||
                    c.date === null
        )));

        socket.emit('update', {todolist: todolist});
        socket.broadcast.emit('update', {todolist: todolist});
    });
    // Supprimer la tâche i
    socket.on('sup_msg', function (i) {
        todolist.splice(i, 1);
        writeList();
        socket.emit('update', {todolist: todolist});
        socket.broadcast.emit('update', {todolist: todolist});
    });
});

server.listen(8080);