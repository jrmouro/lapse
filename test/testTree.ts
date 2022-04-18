import { ILapse, Lapse } from "../lapse/lapse";
import { LengthConcurrentlyLapseHow } from "../lapse/lapseHow";
import { Tree } from "../tree";

var dia:ILapse<string> = new Lapse<string>('dia', 1, 24);

var dormir = new Lapse<string>('dormir', 1, 8);
var almoco = new Lapse<string>('almoço', 12, 1);
var expediente = new Lapse<string>('expediente', 9, 8);
var faculdade = new Lapse<string>('faculdade', 19, 4);

var ofn1 = new Lapse<string>('ofn1', 19, 4);

var tDia = new Tree(dia);


console.log('\n' + tDia.toString());

