/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var Horaire = function (h, m) {
    this.h = parseInt(h);
    this.m = parseInt(m);
    this.f = new Intl.NumberFormat('fr', {minimumIntegerDigits: 2});
};
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
var ChronoMessage = function (date, jour, debut, fin, message) {
    if (date === null) {
        this.date = date;
    } else {
        this.date = new Date(date);
    }
    this.jour = jour;
    this.debut = new Date(debut);
    this.fin = new Date(fin);
    this.message = message;
};
var printChronoliste = function (msg, liste) {
    console.log(msg + '\n');
    for (let cm of liste) {
        console.log(cm.toVeryString());
    }
};
var sameday = function (d1, d2) {
    try {
        return d1.getDate() === d2.getDate() &&
                d1.getMonth() === d2.getMonth() &&
                d1.getFullYear() === d2.getFullYear();
    } catch (err) {
        return false;
    }
};
var noDoublon = function (liste, cmp = (x1, x2) => x1 - x2) {
    newliste = [];
    if (liste.length > 0) {
        liste = liste.sort(cmp);
        newliste.push(liste[0]);
        for (var i = 1; i < liste.length; i += 1) {
            if (cmp(liste[i], liste[i - 1]) !== 0) {
                newliste.push(liste[i]);
            }
        }
    }
    return newliste;
};
var datify = function (liste) {    
    console.log("-----------Début de datify-------------");
    console.log(liste);
    var newliste = [];
    for (var e of liste) {
        var cm = new ChronoMessage(
                e.date,
                e.jour,
                e.debut,
                e.fin,
                e.message);
        if (cm !== null && cm !== undefined) {
            newliste.push(cm);
        }
    }
    console.log("-----------Fin de datify-------------");
    return newliste;
};
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
var schedule = function (next, afunction, n = null, retro = true, arg = null) {
    var now = new Date(Date.UTC(next.getFullYear()), next.getMonth(), next.getDate());
    var timeout;
    if (now < next) {
        timeout = next - now;
    } else {
        if (retro)
            timeout = next - now;
        else
            timeout = 0;
    }
    if (n === null) {
        setTimeout(() => {
            afunction(arg);
            schedule(next, afunction, null, retro, arg);
        }, timeout);
    } else if (n > 0) {
        setTimeout(() => {
            afunction(arg);
            schedule(next, afunction, n - 1, retro, arg);
        }, timeout);
}
};
ChronoMessage.prototype.toString = function () {
    return this.message;
};
ChronoMessage.prototype.toVeryString = function () {
    return  this.date + " - " + this.jour + " - " + this.debut + " - " + this.fin + " - " + this.message;
};
try {
    exports.Horaire = Horaire;
    exports.ChronoMessage = ChronoMessage;
    exports.schedule = schedule;
    exports.datify = datify;
    exports.sameday = sameday;
    exports.printChronoliste = printChronoliste;
    exports.noDoublon = noDoublon;
} catch (e) {
    console.log(e);
}
