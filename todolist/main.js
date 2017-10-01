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
            res.render('todolist.ejs', {todolist: todolist});
        })

        /* On ajoute un élément à la todolist */
        .post('/todo/ajouter/', urlencodedParser, function (req, res) {
            //if (req.body.newtodo !== '') {
            //    todolist.push(req.body.newtodo);
            //}
            console.log("/todo/ajouter");
            res.redirect('/todo');
        })

        /* Supprime un élément de la todolist */
        .get('/todo/supprimer/:id', function (req, res) {
            if (req.params.id !== '') {
                todolist.splice(req.params.id, 1);
            }
            res.redirect('/todo');
        });

io.sockets.on('connection', function (socket, pseudo) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function (pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        socket.broadcast.emit('nouveau_client', pseudo);
        console.log("nouveau : " + pseudo);
    });

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('message', function (message) {
        message = ent.encode(message);
        socket.broadcast.emit('message', {pseudo: socket.pseudo, message: message});
    });
    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('add_task', function (message) {
        todolist.push(ent.encode(message));
        //app.render('todolist.ejs', {todolist: todolist});
        console.log("add_task : " + message + " " + todolist);
        socket.emit('update', {todolist: todolist});
        socket.broadcast.emit('update', {todolist: todolist});
    });
});

server.listen(8080);