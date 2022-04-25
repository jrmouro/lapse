import { IBuilder } from "./builder";
import { IBuilderTree } from "./builder_tree";
import { IDivertTree } from "./divert_tree";
import { IFilterTree as IFilterTree } from "./filter_tree";
import { IResultTree } from "./result_tree";

export interface IHow extends IFilterTree, IBuilderTree, IResultTree, IDivertTree {
    direction(): boolean;
    clone(): IHow;
}

export abstract class How implements IHow {

    private _level: number = -1;
    private _previousLevel: number = -1;

    constructor(
        private _filter: IFilterTree,
        private _builder: IBuilderTree,
        private _direction: boolean = true) { }


    builder(parent: Object, child: Object, builder: IBuilder): Object[] {
        return this._builder.builder(parent, child, builder);
    }

    abstract divert(parent: Object, child: Object,  level:number, leaf:boolean): boolean;

    abstract result(child: Object, builderResult: Object): boolean;

    backtrace(): boolean {
        return this._previousLevel > this._level;
    }

    direction(): boolean {
        return this._direction;
    }

    continues(): boolean {
        return true;
    }

    level(value: number): void {
        this._previousLevel = this._level;
        this._level = value;
    }

    leaf(value: boolean): void { }

    abstract clone(): IHow;

    filter(parent: Object, child: Object, level:number, leaf:boolean): boolean {
        return this._filter.filter(parent, child, level, leaf);
    }

}