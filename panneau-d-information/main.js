var app = require('express')(),
        server = require('http').createServer(app),
        io = require('socket.io').listen(server),
        ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
        fs = require('fs'),
        mongoclient = require('mongodb').MongoClient,
        session = require('cookie-session'),
        bodyParser = require('body-parser'),
        ChronoMessage = require('myownmodules/ChronoMessage').ChronoMessage,
        urlencodedParser = bodyParser.urlencoded({extended: false});


var todolist = [];

function readLperm() {
    fs.readFile('lperm', 'utf8', (err, data) => {
        if (err) {
            console.log("Erreur de lecture du fichier lperm");
        } else {
            try {
                todolist = JSON.parse(data);
                nettoyageListe();
            } catch (e) {
                console.log("Erreur de chargement de la liste");
            }
        }
    });
}

function writeList() {
    fs.writeFile('lperm', JSON.stringify(todolist) + '\n', (err) => {
        if (err) {
            console.log("Problème d'écriture dans le fichier lperm")
        }
    });
}

function nettoyageListe() {
    var date = JSON.stringify(new Date()).substring(1);
    // Attention STRINGIFY gère mal les dates. C'est tout ce que j'ai trouvé,
    // pour l'instant, pour filtrer les dates qui correspondent à aujourd'hui.
    // Comme une date stringifyée s'écrit comme ça : 2017-11-04T22:59:00.000Z
    // afin de comparer la date seule (sans l'heure) je prends la sous-chaîne
    // composée des 10 premières lettres.
    //
    // Par ailleurs, le résultat est une chaine avec des guillements. Il faut
    // enlever le premier, d'où le JSON.stringify(new Date()).substring(1)
    todolist = todolist.filter(c => c.date === null || 
            c.date.substring(0,10) === date.substring(0,10));
}

readLperm();

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
        /* On affiche la todolist et le formulaire */
        .get('/read', function (req, res) {
            res.sendFile(__dirname + '/read.html');
            //res.sendFile('/index.html', {root: __dirname});
        })
        /* On affiche la todolist et le formulaire */
        .get('/write', function (req, res) {
            res.sendFile(__dirname + '/write.html');
            //res.sendFile('/index.html', {root: __dirname});
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

        /* On redirige vers la todolist si la page demandée n'est pas trouvée */
        .use(function (req, res, next) {
            res.redirect('/read');
        });

io.sockets.on('connection', function (socket) {
    socket.on('new', function (message) {
        socket.broadcast.emit('update', {todolist: todolist});
        socket.emit('update', {todolist: todolist});
    });
    // Une tâche a été ajoutée
    socket.on('change_list', function (liste) {
        //var vcm = new ChronoMessage(cm.date, cm.debut, cm.fin, cm.message);
        //todolist.push(vcm);
        todolist = liste;
        writeList();

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
    // Décaler la tâche i vers le haut
    socket.on('up_msg', function (i) {
        if (i > 0) {
            x = todolist[i - 1];
            todolist[i - 1] = todolist[i];
            todolist[i] = x;
            writeList();
            socket.emit('update', {todolist: todolist});
            socket.broadcast.emit('update', {todolist: todolist});
        }
    });
    // Décaler la tâche i vers le bas
    socket.on('down_msg', function (i) {
        if (i < todolist.length - 1) {
            x = todolist[i + 1];
            todolist[i + 1] = todolist[i];
            todolist[i] = x;
            writeList();
            socket.emit('update', {todolist: todolist});
            socket.broadcast.emit('update', {todolist: todolist});
        }
    });

});

server.listen(8080);