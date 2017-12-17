/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class Horaire {
    constructor(h, m) {
        this.h = parseInt(h);
        this.m = parseInt(m);
        this.f = new Intl.NumberFormat('fr', {minimumIntegerDigits: 2});
    }

    toString() {
        return "->" + this.f.format(this.h) + ':' + this.f.format(this.m);
    }

    fromString(hmstr, def = '09h05') {
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
    }
    /**
     * valueOf() est utilisée utilisée pour les comparaisons.
     * @returns {Number} le nombre de minutes de cet horaire.
     */
    valueOf() {
        return this.h * 60 + this.m;
    }
}

class ChronoMessage {
    /**
     * Un ChronoMessage définit un message et des paramètres pour caractériser
     * son affichage dans le temps.
     * @param {type Date} date : la date d'apparition du message (si null, tout le temps)
     * @param {type String} jour : le jour d'apparition du message, un jour de la semaine (de "lundi" à "dimanche"), valable si date === null
     * @param {type Horaire} debut : l'heure d'apparition du message dans la journée
     * @param {type Horaire} ordre : l'ordre d'apparition dans la journée
     * @param {type Horaire} fin : l'heure de disparation du message dans la journée
     * @param {type String} message
     */
    constructor(date, jour, debut, ordre, fin, message) {
        if (date === null) {
            this.date = date;
        } else {
            this.date = new Date(date);
        }
        this.jour = jour;
        this.debut = new Horaire(debut.h, debut.m);
        this.ordre = new Horaire(ordre.h, ordre.m);
        this.fin = new Horaire(fin.h, ordre.m);
        this.message = message;
    }

    toString() {
        return this.message;
    }
    toVeryString() {
        return  this.date + " - " + this.jour + " - " + this.debut + " - " + this.fin + " - " + this.message;
    }

    forToday() {
        var date = new Date();
        var tjour = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
        var jour = tjour[new Date().getDay()];
        try {
            return ((this.date === null && this.jour === "Tous les jours" || this.jour === jour) ||
                    (this.date !== null && sameday(this.date, date)));
        } catch (err) {
            return false;
        }
    }

    expireLater() {
        var today = new Date();
        var now = new Horaire(today.getHours(), today.getMinutes());
        return this.fin > now;
    }
}

var printChronoliste = function (msg, liste) {
    console.log(msg + '\n');
    for (let cm of liste) {
        console.log(cm.toVeryString());
    }
};
var compareAnyDay = function (c1, c2) {
    try {
        if (c1.debut.getHours() < c2.debut.getHours())
            return -1;
        else if (c1.debut.getHours() > c2.debut.getHours())
            return 1;
        else
            return c1.debut.getMinutes() - c2.debut.getMinutes();
    } catch (e) {
        return 0;
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
var todayAndAfter = function (cm) {
    now = new Date();
    try {
        return (cm.date === null) ||
                (cm.date.getFullYear() > now.getFullYear()) ||
                (cm.date.getFullYear() === now.getFullYear() &&
                        cm.date.getMonth() > now.getMonth()) ||
                (cm.date.getFullYear() === now.getFullYear() &&
                        cm.date.getMonth() === now.getMonth() &&
                        cm.date.getDate() >= now.getDate());
    } catch (err) {
        return true;
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
    var newliste = [];
    for (var e of liste) {
        var cm = new ChronoMessage(
                e.date,
                e.jour,
                e.debut,
                e.ordre,
                e.fin,
                e.message);
        if (cm !== null && cm !== undefined) {
            newliste.push(cm);
        }
    }
    return newliste;
};

function test(quoi, qui = "Yvan") {
    console.log(quoi + " " + qui);
}
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
var schedule = function (next, afunction, arg = null, n = null, retro = true) {
//var now = new Date(Date.UTC(next.getFullYear()), next.getMonth(), next.getDate());
    var now = new Date();
    var demain = new Date(now.getTime() + (1000 * 60 * 60 * 24));
    console.log("SCHEDULE = " + (now - next));
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
            schedule(demain, afunction, null, retro, arg);
        }, timeout);
    } else if (n > 0) {
        setTimeout(() => {
            afunction(arg);
            schedule(demain, afunction, n - 1, retro, arg);
        }, timeout);
}
};
/*
 * Appeleé toutes les secondes dans read.html et write.html 
 * pour afficher la date et heure
 */
var horloge = function (document) {
    var mois = ["janvier", "février", "mars", "avril", "mai", "juin",
        "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    var jour = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    var hm = document.getElementById("div_horloge");
    var d = document.getElementById("div_date");
    var date = new Date();
    var str = date.getHours();
    str += ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    str += ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
    hm.innerHTML = str;
    str = "";
    str += jour[date.getDay()] + " ";
    str += date.getDate() + " ";
    str += mois[date.getMonth()] + " ";
    str += date.getFullYear();
    d.innerHTML = str;
};


try {
    exports.Horaire = Horaire;
    exports.ChronoMessage = ChronoMessage;
    exports.schedule = schedule;
    exports.datify = datify;
    exports.sameday = sameday;
    exports.todayAndAfter = todayAndAfter;
    exports.compareAnyDay = compareAnyDay;
    exports.printChronoliste = printChronoliste;
    exports.test = test;
    exports.noDoublon = noDoublon;
} catch (e) {
    console.log(e);
}
