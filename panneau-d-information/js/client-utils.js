/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*
 * Action à associer à un chechbox.
 * Rend "enabled" ou "disabled" tous les éléments qui ont
 * une classe en commun avec le checkbox (sauf le checkbox lui-même)
 * selon qu'il soit coché ou non.
 */
function toggle(event) {
    var cb = event.target;
    var el = document.querySelector('#' + cb.id);
    var ips = el.dataset.toggleClass;
    for (var e of document.getElementsByClassName(ips)) {
        e.disabled = !cb.checked;
    }
    cb.disabled = false;
}


/*
 * Un ChronoMessage est construit à partir d'éléments html trouvés
 * dans l'élément html elt qui doit contenir :
 *   - un seul élément de classe date
 *   - un seul élément de classe jour
 *   - un seul élément de classe debut
 *   - un seul élément de classe ordre
 *   - un seul élément de classe fin
 *   - un seul élément de classe message
 * @param {type} elt (l'élément html qui contient les éléments du chrnomessage)
 * @returns {undefined} le chronomessage
 */
function getChronoMessage(elt) {
    var eltdate = elt.getElementsByClassName("date")[0];
    var date = $("#" + eltdate.getAttribute("id")).datepicker('getDate');
    var jour = elt.getElementsByClassName("jour")[0].value;
    var hdebut = elt.getElementsByClassName("hdebut")[0].value;
    var mdebut = elt.getElementsByClassName("mdebut")[0].value;
    var hordre = elt.getElementsByClassName("hordre")[0].value;
    var mordre = elt.getElementsByClassName("mordre")[0].value;
    var hfin = elt.getElementsByClassName("hfin")[0].value;
    var mfin = elt.getElementsByClassName("mfin")[0].value;
    var message = elt.getElementsByClassName("message")[0].value;
    return new ChronoMessage(date, jour, new Horaire(hdebut, mdebut), new Horaire(hordre, mordre), new Horaire(hfin, mfin), message);
}

/**
 * Fonction invoquée au clic sur le bouton send de write.html ou editlfutur.html.
 * Elle construit tous les ChronoMessages de la page et envoie la liste au
 * serveur par la socket qui doit être déclarée globale.
 * 
 * @param {type} event
 * @returns {Boolean}
 */
function send(event) {
    var button = event.target;
    var liste = [];

    for (var e of document.getElementsByClassName("liste")) {
        liste.push(getChronoMessage(e));
    }

    var message = document.getElementById("newtodo").value.trim();
    if (message !== "") {
        //var date = document.getElementById("iddp").value;
        var date = $("#iddp").datepicker('getDate');
        if (date !== null) {
            date.setHours(23);
            date.setMinutes(59);
        }
        var hrd = new Horaire(
                (document.getElementById("hdebut").value),
                (document.getElementById("mdebut").value));
        var hro = new Horaire(
                (document.getElementById("hordre").value),
                (document.getElementById("mordre").value));

        var hrf = new Horaire(
                (document.getElementById("hfin").value),
                (document.getElementById("mfin").value));

        console.log(hrf.toString());
        var cm = new ChronoMessage(date, document.getElementById("idjour").value, hrd, hro, hrf, message);

        liste.push(cm);


    }

    liste = datify(liste);

    socket.emit(button.getAttribute("data-type-evt"), liste); // Transmet la liste au serveur
    init();
    return false;
}
/**
 * Pour formater des entiers entre 0 et 99 sur deux caractères.
 * @param {type} i
 * @returns {String}
 */
function format(i) {
    if (i < 10) {
        return "0" + i;
    } else {
        return i;
    }
}


/* <span class="hsep">Date: <input id="iddate" class="date" type="checkbox" />
 * <input disabled id="datepicker" type="text" class="date" autofocus/></span>
 */
function createDate(suffixid = "", date = null) {
    var span = document.createElement("span");
    span.setAttribute("class", "hsep");
    span.appendChild(document.createTextNode("Date : "));

    var elt = document.createElement("input");
    elt.setAttribute("id", "iddate" + suffixid);
    elt.setAttribute("data-toggle-class", "date" + suffixid);
    elt.setAttribute("type", "checkbox");
    elt.addEventListener("click", toggle, false);
    elt.setAttribute("class", "toggled");
    span.appendChild(elt);

    elt = document.createElement("input");
    elt.setAttribute("id", "iddp" + suffixid);
    elt.disabled = true;
    $(elt).datepicker({setDate: date});

    elt.setAttribute("class", "date date" + suffixid);
    elt.setAttribute("type", "text");
    if (date === null)
        elt.value = "";
    else
        elt.value = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    elt.setAttribute("autofocus", true);
    span.appendChild(elt);

    return span;
}


function createJour(name, cname, suffixe = "", jour = "") {
    var span = document.createElement("span");
    span.setAttribute("class", "hsep");
    span.appendChild(document.createTextNode(name + " : "));

    var elt = document.createElement("input");
    elt.setAttribute("id", "idcb" + cname + suffixe);
    elt.setAttribute("class", "toggled");
    elt.setAttribute("type", "checkbox");
    elt.addEventListener("click", toggle, false);
    elt.setAttribute("data-toggle-class", cname + suffixe);
    span.appendChild(elt);

    elt = document.createElement("select");
    elt.setAttribute("disabled", true);
    elt.setAttribute("id", "id" + cname + suffixe);
    elt.setAttribute("class", cname + " " + cname + suffixe);
    elt.setAttribute("name", "nom");

    var jours = ["Tous les jours", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

    for (let j of jours) {
        let opt = document.createElement("option");
        opt.appendChild(document.createTextNode(j));
        elt.appendChild(opt);
    }

    try {
        elt.selectedIndex = jours.indexOf(jour);
    } catch (e) {

    }

    span.appendChild(elt);

    return span;
}

function createHoraire(name, cname, suffixe = "", horaire = null) {
    var span = document.createElement("span");
    span.setAttribute("class", "hsep");
    span.appendChild(document.createTextNode(name + " : "));

    var elt = document.createElement("input");
    elt.setAttribute("id", "id" + cname + suffixe);
    elt.setAttribute("type", "checkbox");
    elt.setAttribute("data-toggle-class", cname + suffixe);
    elt.addEventListener("click", toggle, false);
    elt.setAttribute("class", "toggled");
    span.appendChild(elt);

    elt = document.createElement("select");
    elt.setAttribute("disabled", true);
    elt.setAttribute("id", "h" + cname + suffixe);
    elt.setAttribute("class", "h" + cname + " " + cname + suffixe);
    elt.setAttribute("name", "nom");

    for (let i = 0; i < 24; i++) {
        let opt = document.createElement("option");
        opt.appendChild(document.createTextNode(format(i)));
        elt.appendChild(opt);
    }
    if (horaire !== null) {
        elt.selectedIndex = horaire.h;
    }

    span.appendChild(elt);

    span.appendChild(document.createTextNode(" : "));

    elt = document.createElement("select");
    elt.setAttribute("disabled", true);
    elt.setAttribute("id", "m" + cname + suffixe);
    elt.setAttribute("class", "m" + cname + " " + cname + suffixe);
    elt.setAttribute("name", "nom");
    elt.setAttribute("size", "1");

    for (let i = 0; i < 60; i += 5) {
        let opt = document.createElement("option");
        opt.appendChild(document.createTextNode(format(i)));
        elt.appendChild(opt);
    }
    if (horaire !== null) {
        elt.selectedIndex = horaire.m % 5;
    }

    span.appendChild(elt);

    return span;
}
/*
 *  <textarea cols="80" rows="10" placeholder="Un message" name="newtodo" id="newtodo" ></textarea>        
 */
function createTextArea(id) {
    var elt = document.createElement("textarea");
    elt.setAttribute("id", id);
    elt.setAttribute("name", id);
    elt.setAttribute("cols", 80);
    elt.setAttribute("rows", 10);
    elt.setAttribute("placeholder", "Un message");

    return elt;
}
/*
 * <button id="sendbutton">Envoyer le message</button>
 */
function createSendButton(id, typeEvt) {
    var elt = document.createElement("button");
    elt.setAttribute("id", id);
    elt.setAttribute("data-type-evt", typeEvt);
    elt.appendChild(document.createTextNode("Envoyer le message"));

    return elt;
}
/*
 * Crée le formulaire. 
 * typeevt est le type d'événement à envoyer dans la socket.
 * Par exemple 
 *   - depuis write.html      c'est 'change_list' 
 *   - depuis editlfutur.html c'est 'change_listlfutur'
 */
function create(typeEvt) {
    var n = document.getElementById("msgarea");
    var p = document.createElement("p");
    p.appendChild(createDate());
    p.appendChild(createHoraire("Début", "debut"));
    p.appendChild(createJour("Jour", "jour"));
    p.appendChild(createHoraire("Ordre", "ordre"));
    p.appendChild(createHoraire("Expiration", "fin"));
    p.appendChild(createTextArea("newtodo"));
    p.appendChild(createSendButton("sendbutton", typeEvt));

    n.appendChild(p);
}


function createOneMsg(i, cm) {
    var classe;
    if (i % 2 === 0) {
        classe = "pair";
    } else {
        classe = "impair";
    }
    var p = document.createElement("p");
    p.setAttribute("class", "liste " + classe);
    p.setAttribute("num", i);
    var elt;
    elt = document.createElement("button");
    elt.setAttribute("class", "cliquable");
    elt.appendChild(document.createTextNode("X"));
    elt.addEventListener("click", sup, false);

    p.appendChild(elt);

    p.appendChild(createDate(i, cm.date));
    p.appendChild(createHoraire("Début", "debut", i, cm.debut));
    p.appendChild(createJour("Jour", "jour", i, cm.jour));
    p.appendChild(createHoraire("Ordre", "ordre", i, cm.ordre));
    p.appendChild(createHoraire("Expiration", "fin", i, cm.fin));

    elt = document.createElement("textarea");
    elt.setAttribute("class", "message");
    elt.appendChild(document.createTextNode(cm.toString()));

    p.appendChild(elt);

    return p;
}

function mutex(event) {
    var cbjour = document.getElementById("idcbjour");
    var cbdate = document.getElementById("iddate");
    var jourchoice = document.getElementById("idjour");
    var datechoice = $("#iddp");

    if (cbjour === event.target) {
        if (cbjour.checked) {
            cbdate.checked = false;
            datechoice.value = null;
            datechoice.disabled = true;
        }
    } else if (cbdate === event.target) {
        if (cbjour.checked) {
            cbjour.checked = false;
            jourchoice.selectedIndex = 0;
            jourchoice.disabled = true;
        }
        if (cbdate.checked) {
            let date = new Date();
            datechoice.value = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
        } else {
            datechoice.value = null;
        }
    }
}