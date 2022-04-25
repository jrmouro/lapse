import { IHow } from "../tree/how";
import { ILapse } from "./lapse";
import { ILapseBuilder } from "./lapseBuilder";
import { ComposedLapseBuilderTree, ILapseBuilderTree } from "./lapseBuilderTree";
import { ILapseDivertTree, LapseDivertTree } from "./lapseDivertTree";
import { ILapseFilterTree, LapseFilterTree } from "./lapseFilter";
import { ILapseResultTree, LapseResultTree } from "./lapseResultTree";

export interface ILapseHow<T> extends IHow {
    builder(parent: ILapse<T>, child: ILapse<T>, builder: ILapseBuilder<T>): ILapse<T>[];
    continues(): boolean;
    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): boolean;
    divert(parent: ILapse<T>, child: ILapse<T>, level:number, leaf:boolean): boolean;
    direction(): boolean;
    result(intent: ILapse<T>, result: ILapse<T>): boolean
    clone(): ILapseHow<T>;
}


export class LapseHow<T> implements ILapseHow<T> {

    constructor(
        
        protected _lapseBuilderTree: ILapseBuilderTree<T> = new ComposedLapseBuilderTree(),
        protected _lapseFilterTree: ILapseFilterTree<T> = new LapseFilterTree(),
        protected _lapseDivertTree: ILapseDivertTree<T> = new LapseDivertTree(),
        protected _lapseResultTree: ILapseResultTree<T> = new LapseResultTree(),
        protected _direction: boolean = true) { }
    
    
    builder(parent: ILapse<T>, child: ILapse<T>, builder: ILapseBuilder<T>): ILapse<T>[] {
        return this._lapseBuilderTree.builder(parent, child, builder);
    }

    result(intent: ILapse<T>, result: ILapse<T>): boolean {
        return this._lapseResultTree.result(intent, result);
    }

    clone(): ILapseHow<T>{

        return new LapseHow(
            this._lapseBuilderTree.clone(), 
            this._lapseFilterTree.clone(), 
            this._lapseDivertTree.clone(),
            this._lapseResultTree.clone(),
            this._direction);
        
    }

    continues(): boolean {

        return this._lapseBuilderTree.continues();

    }

    divert(parent: ILapse<T>, child: ILapse<T>, level:number, leaf:boolean): boolean {

        return this._lapseDivertTree.divert(parent, child, level, leaf);

    }

    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): boolean {

        return this._lapseFilterTree.filter(parent, child, level, leaf);

    }

    direction(): boolean {
        return this._direction;
    }

}
