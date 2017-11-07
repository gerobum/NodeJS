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


/*
 * Execute a function everyday at hnext if n == 0
 *                   or n days at hnext if n > 0
 * If rebour then
 *     
 * @param {type} hnext
 * @param {type} afunction
 * @param {type} n
 * @returns {undefined}
 */
function schedule(hnext, afunction, n = null, retro = true, arg = null) {
    var now = new Date();
    var hnow = new Horaire(now.getHours(), now.getMinutes());
    var timeout;
    if (hnow < hnext) {
        timeout = (hnext - hnow) * 60 * 1000;
    } else {
        if (retro)
            timeout = (24 * 60 + (hnext - hnow)) * 1000 * 60;
        else
            timeout = 0;
    }
    if (n === null) {
        setTimeout(() => {
            afunction(arg);
            schedule(hnext, afunction, null, retro, arg);
        }, timeout);
    } else if (n > 0) {
        setTimeout(() => {
            afunction(arg);
            schedule(hnext, afunction, n - 1, retro, arg);
        }, timeout);
}
}

ChronoMessage.prototype.toString = function () {
    return this.message;
};

try {
    exports.Horaire = Horaire;
    exports.ChronoMessage = ChronoMessage;
    exports.schedule = schedule;
} catch (e) {
    console.log(e);
}
