import { IBuilderTree } from "../tree/builder_tree";
import { ILapse } from "./lapse";
import { ILapseBuilder } from "./lapseBuilder";

export interface ILapseBuilderTree<T> extends IBuilderTree {
    builder(parent: ILapse<T>, child: ILapse<T>, builder: ILapseBuilder<T>): ILapse<T>[];
    continues(): boolean;
    clone(): ILapseBuilderTree<T>;
}

export abstract class BaseLapseBuilderTree<T> implements IBuilderTree {
    abstract builder(parent: ILapse<T>, child: ILapse<T>, builder: ILapseBuilder<T>): ILapse<T>[];
    abstract clone(): ILapseBuilderTree<T>;
    continues(): boolean{
        return true;
    }
}

export class ComposedLapseBuilderTree<T> extends BaseLapseBuilderTree<T> {

    builder(parent: ILapse<T>, child: ILapse<T>, builder: ILapseBuilder<T>): ILapse<T>[] {

        let ret: ILapse<T>[] = [];

        if (child.start() > parent.start()) {

            if (child.end() < parent.end()) {

                let e0 = builder.get(parent);
                e0.len(child.start() - parent.start());

                let e2 = builder.get(parent);
                e2.start(child.end() + 1)
                e2.len(parent.end() - e2.start() + 1);

                ret.push(e0);
                ret.push(builder.get(child));
                ret.push(e2);

            } else if (child.end() === parent.end()) {

                let e0 = builder.get(parent);
                e0.len(child.start() - parent.start());

                ret.push(e0);
                ret.push(builder.get(child));

            }

        } else if (child.start() === parent.start()) {

            if (child.end() < parent.end()) {

                let e1 = builder.get(parent);
                e1.start(child.end() + 1);
                e1.len(parent.end() - e1.start() + 1);

                ret.push(builder.get(child));
                ret.push(e1);

            } else if (child.end() === parent.end()) {

                ret.push(builder.get(child));

            }

        }

        return ret;

    }

    clone(): ILapseBuilderTree<T> {
        return new ComposedLapseBuilderTree<T>();
    }



}

export class SingleLapseBuilderTree<T> extends BaseLapseBuilderTree<T> {

    builder(parent: ILapse<T>, child: ILapse<T>, builder: ILapseBuilder<T>): ILapse<T>[] {

        if (child.start() >= parent.start() && child.end() <= parent.end()) {

            return [child];

        }

        return [];

    }

    clone(): ILapseBuilderTree<T> {
        return new SingleLapseBuilderTree();
    }

}

export class LengthLapseBuilderTree<T> extends BaseLapseBuilderTree<T> {

    _accumulator: number = 0;

    constructor(private _baseLapseBuilderTree: SingleLapseBuilderTree<T> | ComposedLapseBuilderTree<T>, private _length?: number) {
        super();
        if (this._length !== undefined) {
            this._accumulator = this._length;
        }
    }

    builder(parent: ILapse<T>, child: ILapse<T>, builder: ILapseBuilder<T>): ILapse<T>[] {

        if (this._length === undefined) {

            this._length = child.len();
            this._accumulator = this._length;

        }

        if (this._accumulator > 0) {

            let diff = this._accumulator - child.len();

            if(diff < 0){

                child.len(this._accumulator);                

            }

            let ret = this._baseLapseBuilderTree.builder(parent, child, builder);

            let acc = 0;

            ret.forEach((lapse) => {

                if (lapse.id() === child.id()) {

                    acc += lapse.len();

                }

            });

            diff = this._accumulator - acc;

            if (diff >= 0) {

                this._accumulator -= acc;

                return ret;

            }

        }

        return [];

    }

    clone(): ILapseBuilderTree<T> {
        return new LengthLapseBuilderTree<T>(this._baseLapseBuilderTree.clone(), this._length);
    }

    continues(): boolean {
        return this._accumulator > 0;
    }

}


export class ConcurrentlyLapseBuilderTree<T> extends BaseLapseBuilderTree<T> {

    constructor(private _baseLapseBuilderTree: BaseLapseBuilderTree<T>, private _results: ILapse<T>[] = []) {
        super();
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


    builder(parent: ILapse<T>, child: ILapse<T>, builder: ILapseBuilder<T>): ILapse<T>[] {
        
        if (!this.concurrently(child)) {

            return this._baseLapseBuilderTree.builder(parent, child, builder);

        }

        return [];
    }

    clone(): ILapseBuilderTree<T> {
        return new ConcurrentlyLapseBuilderTree(this._baseLapseBuilderTree.clone(), this._results);
    }

}


export class AheadFixedLapseBuilderTree<T> extends BaseLapseBuilderTree<T> {

    constructor(private baseLapseBuilderTree: BaseLapseBuilderTree<T>) {
        super();
    }

    builder(parent: ILapse<T>, child: ILapse<T>, builder: ILapseBuilder<T>): ILapse<T>[] {

        if (child.start() < parent.start()) {

            child.start(parent.start());

        }

        return this.baseLapseBuilderTree.builder(parent, child, builder);

    }

    clone(): ILapseBuilderTree<T> {

        return new AheadFixedLapseBuilderTree(this.baseLapseBuilderTree.clone());

    }

}

export class AheadFlexibleLapseBuilderTree<T> extends BaseLapseBuilderTree<T> {

    constructor(private baseLapseBuilderTree: BaseLapseBuilderTree<T>) {
        super();
    }

    builder(parent: ILapse<T>, child: ILapse<T>, builder: ILapseBuilder<T>): ILapse<T>[] {

        if (child.start() > parent.end()) {

            return [];

        }

        if (child.start() < parent.start()) {

            child.start(parent.start());

        }

        let diff = parent.end() - child.end();

        if (diff < 0) {

            child.len(child.len() + diff);

        }

        return this.baseLapseBuilderTree.builder(parent, child, builder);

    }

    clone(): ILapseBuilderTree<T> {

        return new AheadFlexibleLapseBuilderTree(this.baseLapseBuilderTree.clone());

    }

}