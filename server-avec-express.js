var app = require('express')();

function is_int(value){
  return (parseFloat(value) === parseInt(value)) && !isNaN(value);
}
app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send("<h1>Vous êtes à l'accueil</h1>");
}).get('/cave', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send("<h1>Vous êtes à la cave</h1>");
}).get('/formulaire', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send('Quels sont vos nom et prénom ?');
}).get('/etage/:num', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    var num = req.params.num;
    if (is_int(num)) {
        res.send("Vous êtes à l'étage n°" + num);
    } else {
        res.send("L'étage n°" + num + " est inconnu");
    }
}).get('/etage/:nume/chambre/:numc', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    var num_etage = req.params.nume;
    var nom_chambre = req.params.numc;
    if (is_int(num_etage)) {
        //res.send("Vous êtes à la chambre " + numc + " de l'étage n°" + nume);
        res.render('chambre.ejs', {num_etage: num_etage, nom_chambre: nom_chambre});
    } else {
        res.render('inconnu.ejs', {num_etage: num_etage});
    }
}).get('/compter/:nombre', function(req, res) {
    var noms = ['Robert', 'Jacques', 'David'];
    res.render('page.ejs', {compteur: req.params.nombre, noms: noms});

}).use(function (req, res, next) {
    res.setHeader('Content-Type', 'text/html')
    res.status(404).send("<h1>Page introuvable !</h1>");
});

app.listen(8080);
