import { IFilterTree } from "../tree/filter_tree";
import { ILapse } from "./lapse";

export interface ILapseFilterTree<T> extends IFilterTree{
    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): boolean;
    clone(): ILapseFilterTree<T>;
}

export class NoLapseFilterTree<T> implements ILapseFilterTree<T> {

    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): boolean {

       return true;

    }

    clone(): ILapseFilterTree<T> {

        return new NoLapseFilterTree();

    }

}

export class LapseFilterTree<T> implements ILapseFilterTree<T> {

    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): boolean {

        if (child.start() >= parent.start() && child.end() <= parent.end()) {

            return true;

        }

        return false;

    }

    clone(): ILapseFilterTree<T> {

        return new LapseFilterTree();

    }

}

export class LevelLapseFilterTree<T> extends LapseFilterTree<T>{

    protected _level: number = -1;
    private _previousLevel: number = -1;

    constructor(protected _maxLevel?: number) {
        super();
    }

    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): boolean {

        this._previousLevel = this._level;
        this._level = level;

        if (this._maxLevel) {

            if (level > this._maxLevel) {

                return false;

            }

        }

        return super.filter(parent, child, level, leaf);

    }

    clone(): ILapseFilterTree<T> {

        return new LevelLapseFilterTree(this._maxLevel);

    }


    backtracking(): boolean {
        return this._previousLevel > this._level;
    }

}


export class IdCheckpointLapseFilter<T> extends LevelLapseFilterTree<T>{

    protected _mapLevel: Map<T, number> = new Map();

    constructor(private checkpoints: Set<T>, maxLevel?: number) {
        super(maxLevel);
        checkpoints.forEach((id) => {
            this._mapLevel.set(id, -1);
        });
    }

    check(): boolean {

        for (let [id, value] of this._mapLevel) {

            if (value < 0) {

                return false;

            }

        }

        return true;

    }

    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): boolean {

        let aux = super.filter(parent, child, level, leaf);

        if (aux) {

            let levelParent = this._mapLevel.get(parent.id());

            if (levelParent !== undefined) {

                if (levelParent < 0) {

                    this._mapLevel.set(parent.id(), level);

                }else if(levelParent >= level){

                    this._mapLevel.set(parent.id(), -1);

                }

            }

            return this.check();

        }

        return false;

    }

    clone(): ILapseFilterTree<T> {

        return new IdCheckpointLapseFilter<T>(this.checkpoints, this._maxLevel);

    }

}

export class IdTargetLapseFilter<T> extends LapseFilterTree<T>{

    constructor(private targets: Set<T>) {
        super();
    }

    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): boolean {

        if (!leaf || (leaf && this.targets.has(parent.id()))) {

            return true;

        }

        return false;

    }

    clone(): ILapseFilterTree<T> {

        return new IdTargetLapseFilter(this.targets);

    }

}

