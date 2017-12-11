/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


schedule = require('./js/ChronoMessage').schedule;
test = require('./js/ChronoMessage').test;

var next = new Date();
next.setHours(18);
next.setMinutes(20);

schedule(next, test, "Moi", 2, false);