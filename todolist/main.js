var app = require('express')(),
        server = require('http').createServer(app),
        io = require('socket.io').listen(server),
        ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
        fs = require('fs'),
        session = require('cookie-session'),
        bodyParser = require('body-parser'),
        urlencodedParser = bodyParser.urlencoded({extended: false});

var todolist = [];


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
        .get('/todo', function (req, res) {
            res.sendfile(__dirname + '/index.html');
        })

        /* Supprime un élément de la todolist */
        .get('/todo/supprimer/:id', function (req, res) {
            if (req.params.id !== '') {
                todolist(req.params.id, 1);
                req.socket.emit('update', {todolist: todolist});
                req.socket.broadcast.emit('update', {todolist: todolist});
            }
            res.redirect('/todo');
        })

        /* On redirige vers la todolist si la page demandée n'est pas trouvée */
        .use(function (req, res, next) {
            res.redirect('/todo');
        });

io.sockets.on('connection', function (socket, pseudo) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et 
    // on informe les autres personnes
    socket.on('nouveau_client', function (pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        socket.broadcast.emit('nouveau_client', pseudo);
        socket.emit('update', {todolist: todolist});
    });
    // Une tâche a été ajoutée
    socket.on('add_task', function (pair) {
        todolist.push("<strong>"+ent.encode(pair.message)+"</strong><em>   from [" + pair.pseudo + "]</em>");
        socket.emit('update', {todolist: todolist});
        socket.broadcast.emit('update', {todolist: todolist});
    });
    // Supprimer la tâche i
    socket.on('sup_task', function (i) {
        todolist.splice(i, 1);
        socket.emit('update', {todolist: todolist});
        socket.broadcast.emit('update', {todolist: todolist});
    });
    // Décaler la tâche i vers le haut
    socket.on('up_task', function (i) {
        if (i > 0) {
            x = todolist[i - 1];
            todolist[i - 1] = todolist[i];
            todolist[i] = x;
            socket.emit('update', {todolist: todolist});
            socket.broadcast.emit('update', {todolist: todolist});
        }
    });
    // Décaler la tâche i vers le bas
    socket.on('down_task', function (i) {
        if (i < todolist.length - 1) {
            x = todolist[i + 1];
            todolist[i + 1] = todolist[i];
            todolist[i] = x;
            socket.emit('update', {todolist: todolist});
            socket.broadcast.emit('update', {todolist: todolist});
        }
    });
});

server.listen(8080);