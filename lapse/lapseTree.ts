import { Tree } from "../tree/tree";
import { ILapse, Lapse } from "./lapse";
import { LapseBuilder } from "./lapseBuilder";
import { ILapseHow } from "./lapseHow";


export class LapseTree<T> extends Tree{

    constructor(lapse: Lapse<T>, final: boolean = false) {

        super(lapse, new LapseBuilder(), final);

    }

    add(lapse: ILapse<T> | ILapse<T>[], how: ILapseHow<T>, final: boolean = false): ILapse<T>[] {

        return <ILapse<T>[]>super.add(lapse, how, final);

    }

}