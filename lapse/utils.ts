import { ILapse } from "./lapse";


export function intersectionValues(values: number[][]): number[] {

    if (values.length > 0) {

        let start = Number.MIN_SAFE_INTEGER;
        let end = Number.MAX_SAFE_INTEGER;

        values.forEach((v) => {
            if (v[0] > start) start = v[0];
            if (v[1] < end) end = v[1];
        });

        if (end - start + 1 <= 0) {
            return [];
        }

        return [start, end];

    }

    return [];

}

export function intersectionLapse<T>(lapses: ILapse<T>[], clonable: ILapse<T>): ILapse<T> | undefined {

    let aux1: number[][] = [];

    lapses.forEach((l) => {


        aux1.push([l.start(), l.end()]);

    });

    let aux2 = intersectionValues(aux1);

    if (aux2.length > 0) {
        let aux3 = clonable.clone();
        aux3.start(aux2[0]);
        aux3.len(aux2[1] - aux2[0] + 1);
        return aux3;
    }

    return undefined;

}

export function differenceLapse<T>(lapse: ILapse<T>, lapses: ILapse<T>[], clonable: ILapse<T>): ILapse<T>[] {
    
    let ret: ILapse<T>[] = [];
    let aux1: number[][] = [];

    lapses.forEach((l) => {

        aux1.push([l.start(), l.end()]);

    });

    let aux2 = differenceValues([lapse.start(), lapse.end()], aux1);

    aux2.forEach((v)=>{

        let aux3 = clonable.clone();
        aux3.start(v[0]);
        aux3.len(v[1] - v[0] + 1);
        ret.push(aux3);

    })

    return ret;
}

export function differenceValues(a: number[], b: number[][]): number[][] {

    let ret: number[][] = [a];

    b.forEach((c) => {

        let aux: number[][] = [];

        ret.forEach((e) => {

            let aux2 = differenceValuesAux(e, c);

            //if (aux2 !== undefined) {

            aux2.forEach((f) => {
                aux.push(f);
            })

            //}

        });

        ret = aux;

    });

    //if (ret.length === 0) return undefined;

    return ret;

}

export function differenceValuesAux(a: number[], b: number[]): number[][] {

    let inters = intersectionValues([a, b]);

    if (inters.length > 0) {

        let ret: number[][] = [];
        //let aux = false;

        if (inters[0] > a[0]) {

            ret.push([a[0], inters[0] - 1]);
            //aux = true;

        }

        if (inters[1] < a[1]) {

            ret.push([inters[1] + 1, a[1]]);
            //aux = true;

        }

        //if (aux) return ret;

        return ret;

    }

    return [[a[0], a[1]]];

}

export function splitPointsValues(start: number, len: number, point: number[]): number[] {

    point.sort((a, b) => a - b);

    return splitPointsAuxValues(start, len, point);

}

export function splitPointsAuxValues(start: number, len: number, point: number[]): number[] {

    let ret: number[] = [];

    point.forEach((p) => {

        let s = splitPointValues(start, len, p);

        if (s.length > 2) {

            ret.push(s[0]);
            ret.push(s[1]);
            start = s[2];
            len = s[3]

        }

    });

    ret.push(start);
    ret.push(len)


    return ret;

}

export function splitPointValues(start: number, len: number, point: number): number[] {

    let ret = [start, len];


    if (point <= start || point > start + len - 1) {
        return ret;
    }

    ret[1] = point - start;
    ret[2] = point;
    ret[3] = start + len - point;

    return ret;

}


// var a = [3, 10];
// var b = [[5, 5]];

// console.log(differenceValues(a, b))
