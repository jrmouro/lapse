import { IDivertTree } from "../tree/divert_tree";
import { ILapse } from "./lapse";

export interface ILapseDivertTree<T> extends IDivertTree {
    divert(parent: ILapse<T>, child: ILapse<T>, level:number, leaf:boolean): boolean;
    clone(): ILapseDivertTree<T>;
}

export class LapseDivertTree<T> implements ILapseDivertTree<T>{
    
    divert(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): boolean {
        return leaf;
    }

    clone(): ILapseDivertTree<T> {
        return new LapseDivertTree();
    }

}

export class TargetIdLapseDivertTree<T> implements ILapseDivertTree<T>{

    constructor(private _targets:Set<T>){}
    
    divert(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): boolean {
        return this._targets.has(parent.id());
    }

    clone(): ILapseDivertTree<T> {
        return new TargetIdLapseDivertTree(this._targets);
    }

}

export class LevelLapseDivertTree<T> implements ILapseDivertTree<T>{

    constructor(private _level:number){}
    
    divert(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): boolean {
        return this._level === level;
    }

    clone(): ILapseDivertTree<T> {
        return new LevelLapseDivertTree(this._level);
    }

}