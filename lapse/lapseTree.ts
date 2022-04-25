import { Tree } from "../tree/tree";
import { ILapse } from "./lapse";
import { ILapseBuilder, LapseBuilder } from "./lapseBuilder";
import { ILapseHow } from "./lapseHow";

export interface ILapseTree<T> extends Tree{
    
    add(lapse: ILapse<T> | ILapse<T>[], how: ILapseHow<T>, final: boolean): ILapse<T>[];
}

export class LapseTree<T> extends Tree{

    constructor(lapse: ILapse<T>, lapseBuilder: ILapseBuilder<T> = new LapseBuilder(), final: boolean = false) {

        super(lapse, lapseBuilder, final);

    }

    add(lapse: ILapse<T> | ILapse<T>[], how: ILapseHow<T>, final: boolean = false): ILapse<T>[] {

        return <ILapse<T>[]>super.add(lapse, how, final);

    }

}