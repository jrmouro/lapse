import { DependencyIdLapse, ILapse, Lapse } from "../lapse/lapse";
import { ILapseApplicationResultCallback, LapseApplication } from "../lapse/lapseApplication";
import { IdTargetLapseFilter } from "../lapse/lapseFilter";
import { AndLapseFilters } from "../lapse/lapseFilters";
import { ConcurrentlyLapseHow, LengthConcurrentlyLapseHow, LengthLapseHow, LengthParallelLapseHow } from "../lapse/lapseHow";
import { ILapseIntent } from "../lapse/lapseIntent";

var dia = new Lapse<string>('dia', 1, 24);
var expediente = new Lapse<string>('expediente', 8, 8);
var almoco = new Lapse<string>('almoço', 12, 1);

var oficina1 = new Lapse<string>('oficina1');
var oficina2 = new Lapse<string>('oficina2');


var maq1 = new Lapse<string>('maq1');
var maq2 = new Lapse<string>('maq2');
var maq3 = new Lapse<string>('maq3');
var maq4 = new Lapse<string>('maq4');


var operador1 = new Lapse<string>('operador1');
var operador2 = new Lapse<string>('operador2');
var operador3 = new Lapse<string>('operador3');

var tarefa1 = new Lapse<string>('tarefa1');
var tarefa2 = new Lapse<string>('tarefa2');
var tarefa3 = new DependencyIdLapse<string>(new Map<string,boolean>([['tarefa1', true]]), 'tarefa3');
var tarefa4 = new DependencyIdLapse<string>(new Map<string, boolean>([['tarefa2', true], ['tarefa3', true]]), 'tarefa4');
var tarefa5 = new DependencyIdLapse<string>(new Map<string,boolean>([['tarefa4', true]]),'tarefa5');
var tarefa6 = new DependencyIdLapse<string>(new Map<string,boolean>([['tarefa5', true]]),'tarefa6');

//operador1: maq1 ou maq2
//operador2: maq2 ou maq3
//operador3: maq3 ou maq4

//tarefa1: maq1
//tarefa2: maq2 ou maq3 
//tarefa3: maq1 ou maq4 / depende tarefa1 / paralela
//tarefa4: maq4 / depende tarefa2 e tarefa3
//tarefa5: maq1 ou maq3 / depende tarefa4
//tarefa6: maq1 / depende tarefa5

var app = new LapseApplication<string>();

var intent_almoco: ILapseIntent<string> = {
    lapse: almoco,
    how: new ConcurrentlyLapseHow(),
    final: true
}

var intent_expediente: ILapseIntent<string> = {
    lapse: expediente,
    how: new LengthConcurrentlyLapseHow(
        expediente.len(),
        [],
        new AheadFlexibleLapseFilter(),
        new AndLapseFilters(
            [
                new IdTargetLapseFilter(new Set(['dia']))
            ])),
    final: false
}

var intent_oficina: ILapseIntent<string> = {
    lapse: [oficina1, oficina2],
    how: new LengthParallelLapseHow(
        expediente.len(),
        new Set(['expediente']),
        new AheadFlexibleLapseFilter()),
    final: false
}

var intent_maq1_maq2: ILapseIntent<string> = {
    lapse: [maq1, maq2],
    how: new LengthParallelLapseHow(
        expediente.len(),
        new Set(['oficina1']),
        new AheadFlexibleLapseFilter()),
    final: false
}

var intent_maq3_maq4: ILapseIntent<string> = {
    lapse: [maq3, maq4],
    how: new LengthParallelLapseHow(
        expediente.len(),
        new Set(['oficina2']),
        new AheadFlexibleLapseFilter()),
    final: false
}

var intent_tarefa1: ILapseIntent<string> = {
    lapse: [tarefa1],
    how: new LengthConcurrentlyLapseHow(
        6,
        [],
        new AheadFlexibleLapseFilter(),
        new AndLapseFilters(
            [
                new IdTargetLapseFilter(new Set(['maq1']))
            ])),
    final: false
}

var intent_tarefa2: ILapseIntent<string> = {
    lapse: [tarefa2],
    how: new LengthConcurrentlyLapseHow(
        5,
        [],
        new AheadFlexibleLapseFilter(),
        new AndLapseFilters(
            [
                new IdTargetLapseFilter(new Set(['maq2', 'maq3']))
            ])),
    final: false
}

var intent_tarefa3: ILapseIntent<string> = {
    lapse: [tarefa3],
    how: new LengthLapseHow(
        5,
        new AheadFlexibleLapseFilter(),
        new AndLapseFilters(
            [
                new IdTargetLapseFilter(new Set(['maq1', 'maq4']))
            ])),
    final: false
}

var intents = [
    intent_almoco, 
    intent_expediente, 
    intent_oficina, 
    intent_maq1_maq2, 
    intent_maq3_maq4,
    intent_tarefa1,
    intent_tarefa2,
    intent_tarefa3
];

var callback = new class implements ILapseApplicationResultCallback<string>{

    result(lapseIntent: ILapseIntent<string>, result: ILapse<string>[], tree: LapseTree<string>): boolean {

        result.forEach((lapse)=>{

            tarefa3.setDependencyResult(lapse);
            tarefa4.setDependencyResult(lapse);
            tarefa5.setDependencyResult(lapse);
            tarefa6.setDependencyResult(lapse);

        });

        return false;

    };

}();

var tree = app.run(dia, intents, callback);

console.log(tree.toString());




// tDia.add(almoco, new ConcurrentlyLapseHow());
// tDia.add(expediente, new LengthConcurrentlyLapseHow(expediente.len(), [], new AheadFlexibleLapseFilter(), new AndLapseFilters([new IdTargetLapseFilter(new Set(['dia']))])), true);
// tDia.add(oficina, new LengthConcurrentlyLapseHow(expediente.len(), [], new AheadFlexibleLapseFilter(), new AndLapseFilters([new IdTargetLapseFilter(new Set(['expediente']))])), true);
// tDia.add([maq1, maq2, maq3, maq4], new LengthParallelLapseHow(expediente.len(), new Set(['oficina']), new AheadFlexibleLapseFilter()), true);


// tDia.add(
//     tarefa1,
//     new LengthConcurrentlyLapseHow(
//         6,
//         [],
//         new AheadFlexibleLapseFilter(),
//         new AndLapseFilters(
//             [new IdTargetLapseFilter(
//                 new Set(['maq1']))])),
//     true);



// tDia.add([tarefa3, tarefa4], new LengthConcurrentlyLapseHow(4, true, new AheadFlexibleLapseFilter(), new AndLapseFilters([new IdTargetLapseFilter(new Set(['maq1', 'maq2', 'maq3', 'maq4']))])));


// tDia.add(operador1, new LengthConcurrentlyLapseHow(expediente.len() - 1, true, new AheadFlexibleLapseFilter(), new AndLapseFilters([new IdCheckpointLapseFilter(new Set(['maq1']))])), true);
// tDia.add(operador2, new LengthConcurrentlyLapseHow(expediente.len(), true, new AheadFlexibleLapseFilter(), new AndLapseFilters([new IdCheckpointLapseFilter(new Set(['maq3']))])), true);

// console.log(tDia.toString());