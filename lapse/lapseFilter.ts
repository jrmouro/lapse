import { IFilter } from "../filter";
import { ILapse } from "./lapse";


export abstract class _LapseFilter<T> implements IFilter {

    abstract filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): ILapse<T> | undefined;
    abstract clone(): _LapseFilter<T>;

}

export class FixedLapseFilter<T> extends _LapseFilter<T>{

    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): ILapse<T> | undefined {

        if (child.start() >= parent.start() && child.end() <= parent.end()) {

            return child;

        }

        return undefined;

    }

    clone(): FixedLapseFilter<T> {

        return new FixedLapseFilter();

    }

}

export class AheadFlexibleLapseFilter<T> extends _LapseFilter<T>{

    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): ILapse<T> | undefined {

        if (child.start() > parent.end()) {

            return undefined;

        }

        if (child.start() < parent.start()) {

            child.start(parent.start());

        }

        let diff = parent.end() - child.end();

        if (diff < 0) {

            child.len(child.len() + diff);

        }

        return child;

    }

    clone(): AheadFixedLapseFilter<T> {

        return new AheadFlexibleLapseFilter();

    }

}

export class AheadFixedLapseFilter<T> extends FixedLapseFilter<T>{

    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): ILapse<T> | undefined {

        if (child.start() < parent.start()) {

            child.start(parent.start());

        }

        return super.filter(parent, child, level, leaf);

    }

    clone(): AheadFixedLapseFilter<T> {

        return new AheadFixedLapseFilter();

    }

}

export class IdCheckpointLapseFilter<T> extends _LapseFilter<T>{

    protected _mapLevel: Map<T, number> = new Map();
    private _level: number = -1;

    constructor(protected checkpoints: Set<T>) {
        super();
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

    backtracking(level: number, checkpoint: T): void {

        if (level <= this._level) {

            this._mapLevel.forEach((l, id) => {

                if (level <= l) {

                    this._mapLevel.set(id, -1);

                }

            })

        }

        if (this._mapLevel.get(checkpoint) !== undefined)
            this._mapLevel.set(checkpoint, level);



        this._level = level;

    }

    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): ILapse<T> | undefined {

        this.backtracking(level, parent.id());

        if (!leaf || (leaf && this.check())) {

            return child;

        }

        return undefined;

    }

    clone(): _LapseFilter<T> {

        return new IdCheckpointLapseFilter(this.checkpoints);

    }

}

export class IdOrderCheckpointLapseFilter<T> extends IdCheckpointLapseFilter<T>{

    constructor(checkpoints: Set<T>) {
        super(checkpoints);
    }

    check(): boolean {

        let aux = -1;

        for (let id of this.checkpoints) {

            let value = this._mapLevel.get(id);

            if (value! < 0 || value! < aux) {
                return false;
            }

            aux = value!;

        }

        return true;

    }
}


export class IdPathCheckpointLapseFilter<T> extends IdCheckpointLapseFilter<T>{

    constructor(checkpoints: Set<T>) {
        super(checkpoints);
    }

    check(): boolean {

        let aux = -1;

        for (let id of this.checkpoints) {

            let value = this._mapLevel.get(id);

            if (value! < 0 || value! < aux) {
                return false;
            }

            if (aux !== -1) {
                if (value! - aux > 1) return false;
            }

            aux = value!;

        }

        return true;

    }
}
export class IdTargetLapseFilter<T> extends _LapseFilter<T>{

    constructor(private targets: Set<T>) {
        super();
    }

    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): ILapse<T> | undefined {

        if (!leaf || (leaf && this.targets.has(parent.id()))) {

            return child;

        }

        return undefined;

    }

    clone(): _LapseFilter<T> {

        return new IdTargetLapseFilter(this.targets);

    }

}

