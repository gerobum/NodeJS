var app = require('express')();
var liste = ['a','b','c'];

app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.render('todolist.ejs', {liste: liste});
}).use(function (req, res, next) {
    res.setHeader('Content-Type', 'text/html')
    res.status(404).send("<h1>Page introuvable !</h1>");
});

app.listen(8080);
