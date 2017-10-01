var horloge = function(doc) {
    var mois = ["janvier", "février", "mars", "avril", "mai", "juin",
        "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

    var hm = doc.getElementById("div_horloge");
    var d = doc.getElementById("div_date");
    var date = new Date();
    var str = date.getHours();
    str += ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    str += ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();

    hm.innerHTML = str;

    str = "";

    str += date.getDate() + " ";
    str += mois[date.getMonth()] + " ";
    str += date.getFullYear();

    d.innerHTML = str;

};
