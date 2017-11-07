/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function Horaire(h, m) {
    this.h = parseInt(h);
    this.m = parseInt(m);
    this.f = new Intl.NumberFormat('fr', {minimumIntegerDigits: 2});
}

Horaire.prototype.toString = function () {
    return this.f.format(this.h) + ':' + this.f.format(this.m);
};

Horaire.prototype.fromString = function (hmstr, def = '09h05') {
    var er = /[\s0]*([0-9]+)[h:][\s0]*([0-9]*)/g;
    var result = er.exec(hmstr);
    if (result === null) {
        result = er.exec(def);
        if (result === null) {
            result = er.exec('09h05');
        }
    }
    this.h = parseInt(result[1]);
    this.m = parseInt(result[2]);
    if (isNaN(this.m)) {
        this.m = 0;
}
};

/**
 * valueOf() est utilisée utilisée pour les comparaisons.
 * @returns {Number} le nombre de minutes de cet horaire.
 */
Horaire.prototype.valueOf = function () {
    return this.h * 60 + this.m;
};

function ChronoMessage(date, jour, debut, fin, message) {
    this.date = date;
    this.jour = jour;
    this.debut = debut;
    this.fin = fin;
    this.message = message;
}
;

ChronoMessage.prototype.toString = function () {
    return this.message;
};

try {
    exports.Horaire = Horaire;
    exports.ChronoMessage = ChronoMessage;
} catch (e) {
    console.log(e);
}
