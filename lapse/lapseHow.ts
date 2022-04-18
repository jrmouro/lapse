import { IHow } from "../how";
import { ILapse } from "./lapse";
import { FixedLapseFilter, _LapseFilter } from "./lapseFilter";
import { CascadingLapseFilters, LapseFilters } from "./lapseFilters";

export abstract class _LapseHow<T> implements IHow {

    constructor(
        protected _mainFilter: _LapseFilter<T> = new FixedLapseFilter<T>(),
        protected _auxFilters: LapseFilters<T> = new CascadingLapseFilters<T>(),
        protected _direction: boolean = true) { }

    abstract builder(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): ILapse<T>[];
    abstract result(info: ILapse<T>, builderResult: ILapse<T>): boolean;
    abstract clone(): _LapseHow<T>;

    continues(): boolean {

        return true;

    }

    divert(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): boolean {

        return leaf;

    }

    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): ILapse<T> | undefined {

        let c = this._auxFilters.filter(parent, child, level, leaf);

        if (c !== undefined) {

            return this._mainFilter.filter(parent, c, level, leaf);

        }

        return undefined;

    }

    direction(): boolean {
        return this._direction;
    }

}

export class LapseHow<T> extends _LapseHow<T> {

    constructor(
        mainFilter: _LapseFilter<T> = new FixedLapseFilter<T>(),
        auxFilters: LapseFilters<T> = new CascadingLapseFilters<T>(),
        direction: boolean = true) {
        super(mainFilter, auxFilters, direction);
    }

    clone(): LapseHow<T> {


        return new LapseHow(this._mainFilter.clone(), this._auxFilters.clone(), this._direction);

    }


    builder(parent: ILapse<T>, child: ILapse<T>, level: number): ILapse<T>[] {

        let ret: ILapse<T>[] = [];

        if (child.start() > parent.start()) {

            if (child.end() < parent.end()) {

                let e0 = parent.clone();
                e0.len(child.start() - parent.start());

                let e2 = parent.clone();
                e2.start(child.end() + 1)
                e2.len(parent.end() - e2.start() + 1);

                ret.push(e0);
                ret.push(child.clone());
                ret.push(e2);

            } else if (child.end() === parent.end()) {

                let e0 = parent.clone();
                e0.len(child.start() - parent.start());

                ret.push(e0);
                ret.push(child.clone());

            }

        } else if (child.start() === parent.start()) {

            if (child.end() < parent.end()) {

                let e1 = parent.clone();
                e1.start(child.end() + 1);
                e1.len(parent.end() - e1.start() + 1);

                ret.push(child.clone());
                ret.push(e1);

            } else if (child.end() === parent.end()) {

                ret.push(child.clone());

            }

        }

        return ret;

    }


    result(info: ILapse<T>, builderResult: ILapse<T>): boolean {

        if (info.id() === builderResult.id()) {

            return true;

        }

        return false;

    }

}


export class ConcurrentlyLapseHow<T> extends LapseHow<T> {

    constructor(
        protected _results: ILapse<T>[] = [],
        mainFilter: _LapseFilter<T> = new FixedLapseFilter<T>(),
        auxFilters: LapseFilters<T> = new CascadingLapseFilters<T>(),
        direction: boolean = true) {
        super(mainFilter, auxFilters, direction);
    }

    clone(): ConcurrentlyLapseHow<T> {

        let results: ILapse<T>[] = [];
        this._results.forEach((lapse) => {
            results.push(lapse.clone());
        });

        return new ConcurrentlyLapseHow(results, this._mainFilter.clone(), this._auxFilters.clone(), this._direction);

    }

    concurrently(child: ILapse<T>): boolean {

        let ret = false;

        this._results.some((l) => {

            if ((child.start() >= l.start() && child.start() <= l.end()) ||
                (child.end() <= l.end() && child.end() <= l.start())) {
                ret = true;
                return true;
            }

            return false;

        });


        return ret;

    }

    builder(parent: ILapse<T>, child: ILapse<T>, level: number): ILapse<T>[] {

        let ret: ILapse<T>[] = [];

        if (!this.concurrently(child)) {

            return super.builder(parent, child, level)

        }

        return [];

    }


    result(info: ILapse<T>, builderResult: ILapse<T>): boolean {

        if (info.id() === builderResult.id()) {

            this._results.push(builderResult.clone());

            return true;

        }

        return false;

    }

}

export class ParallelLapseHow<T> extends _LapseHow<T>{

    constructor(
        protected _divertLapseId: Set<T>,
        mainFilter: _LapseFilter<T> = new FixedLapseFilter<T>(),
        auxFilters: LapseFilters<T> = new CascadingLapseFilters<T>(),
        direction: boolean = true) {

        super(mainFilter, auxFilters, direction);

    }

    clone(): ParallelLapseHow<T> {

        return new ParallelLapseHow<T>(this._divertLapseId, this._mainFilter.clone(), this._auxFilters.clone(), this._direction);

    }

    builder(parent: ILapse<T>, child: ILapse<T>, level: number): ILapse<T>[] {

        if (child.start() >= parent.start() && child.end() <= parent.end()) {

            return [child];

        }

        return [];

    }

    divert(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): boolean {

        return this._divertLapseId.has(parent.id());

    }

    result(info: ILapse<T>, builderResult: ILapse<T>): boolean {

        if (info.id() === builderResult.id()) {

            return true;
        }

        return false;

    }


}


export class LengthLapseHow<T> extends LapseHow<T>{

    private accumulator: number = -1;

    constructor(
        private _len: number,
        mainFilter: _LapseFilter<T> = new FixedLapseFilter<T>(),
        auxFilters: LapseFilters<T> = new CascadingLapseFilters<T>(),
        direction: boolean = true) {

        super(mainFilter, auxFilters, direction);
        this.accumulator = _len;

    }

    builder(parent: ILapse<T>, child: ILapse<T>, level: number): ILapse<T>[] {

        if (this.accumulator > 0) {

            let len = parent.end() - child.start() + 1;

            let diff = this.accumulator - len;

            if (diff > 0) {

                child.len(len);

            } else {

                child.len(this.accumulator);

            }

            return super.builder(parent, child, level);

        }

        return [];

    }

    result(info: ILapse<T>, builderResult: ILapse<T>): boolean {

        if (super.result(info, builderResult)) {

            this.accumulator -= builderResult.len();

            return true;

        }

        return false;

    }

    clone(): LengthLapseHow<T> {

        return new LengthLapseHow(this._len, this._mainFilter.clone(), this._auxFilters.clone(), this._direction);

    }

    continues(): boolean {

        return this.accumulator !== 0;

    }

}

export class LengthConcurrentlyLapseHow<T> extends ConcurrentlyLapseHow<T>{

    private accumulator: number = -1;

    constructor(
        private _len: number,
        results: ILapse<T>[] = [],
        mainFilter: _LapseFilter<T> = new FixedLapseFilter<T>(),
        auxFilters: LapseFilters<T> = new CascadingLapseFilters<T>(),
        direction: boolean = true) {

        super(results, mainFilter, auxFilters, direction);
        this.accumulator = _len;

    }

    builder(parent: ILapse<T>, child: ILapse<T>, level: number): ILapse<T>[] {

        if (this.accumulator > 0) {

            let len = parent.end() - child.start() + 1;

            let diff = this.accumulator - len;

            if (diff > 0) {

                child.len(len);

            } else {

                child.len(this.accumulator);

            }

            return super.builder(parent, child, level);

        }

        return [];

    }

    result(info: ILapse<T>, builderResult: ILapse<T>): boolean {

        if (super.result(info, builderResult)) {

            this.accumulator -= builderResult.len();

            return true;

        }

        return false;

    }

    clone(): LengthConcurrentlyLapseHow<T> {

        let results: ILapse<T>[] = [];
        this._results.forEach((lapse) => {
            results.push(lapse.clone());
        });

        return new LengthConcurrentlyLapseHow(this._len, results, this._mainFilter.clone(), this._auxFilters.clone(), this._direction);

    }

    continues(): boolean {

        return this.accumulator !== 0;

    }

}

export class LengthParallelLapseHow<T> extends ParallelLapseHow<T>{

    private accumulator: number = -1;

    constructor(

        private _len: number,
        divertLapseId: Set<T>,
        mainFilter: _LapseFilter<T> = new FixedLapseFilter<T>(),
        auxFilters: LapseFilters<T> = new CascadingLapseFilters<T>(),
        direction: boolean = true,) {

        super(divertLapseId, mainFilter, auxFilters, direction);
        this.accumulator = _len;

    }

    builder(parent: ILapse<T>, child: ILapse<T>, level: number): ILapse<T>[] {

        if (this.accumulator > 0) {

            let len = parent.end() - child.start() + 1;

            let diff = this.accumulator - len;

            if (diff > 0) {

                // this.accumulator -= len;
                child.len(len);

            } else {

                child.len(this.accumulator);
                // this.accumulator = 0;

            }

            // let ret = super.builder(parent, child, level);

            // let ac = 0;
            // ret.some((l)=>{

            //     if(l.id() === child.id()){

            //         ac = l.len();
            //         return true;

            //     }

            //     return false;

            // });

            // if(ac === 0){

            //     this.accumulator += child.len();

            // }

            // return ret;

            return super.builder(parent, child, level);

        }

        return [];

    }

    result(info: ILapse<T>, builderResult: ILapse<T>): boolean {

        if (super.result(info, builderResult)) {

            this.accumulator -= builderResult.len();

            return true;

        }

        return false;

    }

    clone(): LengthParallelLapseHow<T> {

        return new LengthParallelLapseHow(this._len, this._divertLapseId, this._mainFilter.clone(), this._auxFilters.clone(), this._direction);

    }

    continues(): boolean {

        return this.accumulator !== 0;

    }

}

