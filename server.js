var http = require('http');
var url = require('url');
var querystring = require('querystring');
    
var response = function(req, res) {
    var page = url.parse(req.url).pathname;
    var params = querystring.parse(url.parse(req.url).query);

    res.writeHead(200, {"Content-Type": "text/plain"});

    if (page == '/') {

        res.write('Vous êtes à l\'accueil, que puis-je pour vous ?');

    } else if (page == '/cave') {

        res.write('Vous êtes dans la cave à vins, ces bouteilles sont à moi !');

    } else if (page == '/etage/1/chambre') {

        res.write('Hé ho, c\'est privé ici !');

    } else if (page == '/formulaire') {
    if ('prenom' in params && 'nom' in params) {

        res.write('Vous vous appelez ' + params['prenom'] + ' ' + params['nom']);

    }

    else {

        res.write('Vous devez bien avoir un prénom et un nom, non ?');

    }

    } else {
        
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write('Page inconnue');
    }

    res.end();

}

var server = http.createServer(response);

server.listen(8080);
