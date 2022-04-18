import { IIdentifiable } from "../identifiable";

export interface ILapse<T> extends IIdentifiable<T> {

    start(value?: number): number;
    len(value?: number): number;
    end(): number;
    clone(): ILapse<T>;

}

export const INVALID_START = Number.MIN_SAFE_INTEGER;
export const INVALID_LEN = Number.MIN_SAFE_INTEGER;
export const INVALID_END = Number.MIN_SAFE_INTEGER;


export class Lapse<T> implements ILapse<T>{

    constructor(
        protected _id: T,
        protected _start: number = 1,
        protected _len: number = 1) { }

    clone(): ILapse<T> {
        return new Lapse<T>(this.id(), this.start(), this.len());
    }

    id(value?: T): T {
        if (value) this._id = value;
        return this._id;
    }

    start(value?: number): number {
        if (value) this._start = value;
        return this._start;
    }

    len(value?: number): number {
        if (value) this._len = value;
        return this._len;
    }

    end(): number {
        return this.start() + this.len() - 1;
    }


    toString(): string {
        return this.start() + '[ ' + this.id() + ' ]' + this.end() + ': ' + this.len();
    }


}

export interface IDependencyRatesLapse {
    start_rate: number,
    len_rate: number
}

export class DependencyIdLapse<T> extends Lapse<T>{

    _resultsLenMap: Map<T, number> = new Map();
    _resultsStartMap: Map<T, number> = new Map();
    _resultsEndMap: Map<T, number> = new Map();
    _dependency: Map<T, IDependencyRatesLapse> = new Map(); 

    constructor(id: T, start:number = 0, len:number = 0) {

        super(id, start, len);

        this._dependency.forEach((dir, _id) => {

            this._resultsLenMap.set(_id, 0);
            this._resultsStartMap.set(_id, Number.MAX_SAFE_INTEGER);
            this._resultsEndMap.set(_id, Number.MIN_SAFE_INTEGER);

        });

    }

    addDependencyLapse(lapse: ILapse<T>, depRates: IDependencyRatesLapse): boolean {

        if (!this._dependency.has(lapse.id())) {

            this._dependency.set(lapse.id(), depRates);
            this._resultsLenMap.set(lapse.id(), 0);
            this._resultsStartMap.set(lapse.id(), Number.MAX_SAFE_INTEGER);
            this._resultsEndMap.set(lapse.id(), Number.MIN_SAFE_INTEGER);
            return true;

        }

        return false;
    }

    setDependencyResult(lapse: ILapse<T>): boolean {

        let len = this._resultsLenMap.get(lapse.id());

        if (len !== undefined) {

            this._resultsLenMap.set(lapse.id(), len + lapse.len());
            this._resultsStartMap.set(lapse.id(), Math.min(lapse.start(), this._resultsStartMap.get(lapse.id())!));
            this._resultsEndMap.set(lapse.id(), Math.max(lapse.end(), this._resultsEndMap.get(lapse.id())!));

            return true;

        }

        return false;

    }


    len(value?: number): number {

        if(this._dependency.size === 0) return super.len(value);

        let min = Number.MAX_SAFE_INTEGER;

        for (var [id, len] of this._resultsLenMap) {

            min = Math.min(min, len * this._dependency.get(id)!.len_rate);

        }

        return min;

    }

    start(value?: number): number {

        if(this._dependency.size === 0) return super.start(value);

        let max = Number.MIN_SAFE_INTEGER;

        for (var [id, dep] of this._dependency) {

            let end = this._resultsEndMap.get(id)!;
            let start = this._resultsStartMap.get(id)!;

            if (start >= 0 && end >= start) {

                max = Math.max(((end - start + 1) * dep.start_rate) + start, max);

            } else {

                return Number.MIN_SAFE_INTEGER;

            }

        }

        return max;

    }

}

var almoco = new Lapse('almoço', 12, 5)
var louca = new DependencyIdLapse('louça');
var chao = new DependencyIdLapse('chão');
var roupa = new DependencyIdLapse('roupa', 8, 2);


louca.addDependencyLapse(almoco, { start_rate: 1, len_rate: 2 });
louca.setDependencyResult(almoco);

chao.addDependencyLapse(louca, { start_rate: 0.7, len_rate: 0.3 })
chao.setDependencyResult(louca);

roupa.setDependencyResult(almoco)

console.log(almoco.toString());
console.log(louca.toString());
console.log(chao.toString());
console.log(roupa.toString());