/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var app = require('express')();
var session = require('cookie-session'); // Charge le middleware de sessions
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var urlencodedParser = bodyParser.urlencoded({ extended: false });


/* On utilise les sessions */
app.use(session({secret: 'todotopsecret'}))

/* S'il n'y a pas de todolist dans la session,
on en crée une vide sous forme d'array avant la suite */
.use(function(req, res, next){
    if (typeof(req.session.todolist) === 'undefined') {
        req.session.todolist = [];
    }
    next();
})

/* On affiche la todolist et le formulaire */
.get('/todo', function(req, res) { 
    res.render('todolist.ejs', {todolist: req.session.todolist});
})

/* On ajoute un élément à la todolist */
.post('/todo/ajouter/', urlencodedParser, function(req, res) {
    if (req.body.newtodo !== '') {
        req.session.todolist.push(req.body.newtodo);
    }
    res.redirect('/todo');
})

/* Supprime un élément de la todolist */
.get('/todo/supprimer/:id', function(req, res) {
    if (req.params.id !== '') {
        req.session.todolist.splice(req.params.id, 1);
    }
    res.redirect('/todo');
})
/* Monte un élément de la todolist */
.get('/todo/up/:id', function(req, res) {
    if (req.params.id !== '') {
        if (req.params.id > 0) {
            x = req.session.todolist[req.params.id-1];
            req.session.todolist[req.params.id-1] = req.session.todolist[req.params.id];
            req.session.todolist[req.params.id] = x;
        }
    }
    res.redirect('/todo');
})
/* Descend un élément de la todolist */
.get('/todo/down/:id', function(req, res) {
    if (req.params.id !== '') {
        console.log(req.params.id + ' longueur : ' + req.session.todolist.length);
        if (req.params.id < req.session.todolist.length-1) {
            x = req.session.todolist[req.params.id+1];
            req.session.todolist[req.params.id+1] = req.session.todolist[req.params.id];
            req.session.todolist[req.params.id] = x;
        }
    }
    res.redirect('/todo');
})

/* On redirige vers la todolist si la page demandée n'est pas trouvée */
.use(function(req, res, next){
    res.redirect('/todo');
})

.listen(8080);