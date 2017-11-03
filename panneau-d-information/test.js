/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var geom = require('myownmodules/geom');

var p1 = new geom.Point(0, 0);
var p2 = new geom.Point(1, 1);
var p3 = new geom.Point(0, 1);

console.log(p1.dist(p2));
console.log(geom.aGauche(p1, p2, p3));

