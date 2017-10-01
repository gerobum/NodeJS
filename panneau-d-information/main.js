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
    socket.on('add_msg', function (message) {
        todolist.push("<strong>" + ent.encode(message) + "</strong>");
        socket.emit('update', {todolist: todolist});
        socket.broadcast.emit('update', {todolist: todolist});
    });
    // Supprimer la tâche i
    socket.on('sup_msg', function (i) {
        todolist.splice(i, 1);
        socket.emit('update', {todolist: todolist});
        socket.broadcast.emit('update', {todolist: todolist});
    });
    // Décaler la tâche i vers le haut
    socket.on('up_msg', function (i) {
        if (i > 0) {
            x = todolist[i - 1];
            todolist[i - 1] = todolist[i];
            todolist[i] = x;
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
            socket.emit('update', {todolist: todolist});
            socket.broadcast.emit('update', {todolist: todolist});
        }
    });
    

    function bip() {
        socket.broadcast.emit('update', {todolist: todolist});
    }
    setInterval(bip, 1000);
});

server.listen(8080);