import { IClonable } from "./clonable";
import { IHow } from "./how";

export interface ITree {
    add(info: IClonable | IClonable[], how: IHow, final: boolean, level: number): IClonable[];
    toString(): string;
    find(callback: (clonable: IClonable) => boolean): boolean;
}

export class Tree implements ITree {

    constructor(protected _info: IClonable, private _final: boolean = false) { }

    protected _childs: Tree[] = [];

    add(info: IClonable | IClonable[], how: IHow, final: boolean = false, level: number = 0): IClonable[] {

        let ret: IClonable[] = [];

        if (!this._final) {

            if (info instanceof Array) {

                info.forEach((i) => {

                    this.add(i, how.clone()).forEach((ii) => {

                        ret.push(ii);

                    })

                });

            } else {

                let filtered = how.filter(this._info.clone(), info.clone(), level, this._childs.length === 0);

                if (filtered !== undefined) {

                    if (how.divert(this._info.clone(), filtered, level, this._childs.length === 0)) {

                        how.builder(this._info.clone(), filtered, level, this._childs.length === 0).forEach((ii) => {

                            if (how.result(filtered!, ii)) {

                                ret.push(ii.clone());
                                this._childs.push(new Tree(ii.clone(), final))

                            } else {

                                this._childs.push(new Tree(ii.clone(), this._final))

                            }

                        });

                    } else {

                        if (how.direction()) {

                            for (let index = 0; index < this._childs.length; index++) {

                                this._childs[index].add(filtered.clone(), how, final, level + 1).forEach((r) => {

                                    ret.push(r);

                                });

                                if (!how.continues()) {

                                    break;

                                }

                            }

                        } else {

                            for (let index = this._childs.length - 1; index >= 0; index--) {

                                this._childs[index].add(filtered.clone(), how, final, level + 1).forEach((r) => {

                                    ret.push(r);

                                });

                                if (!how.continues()) {

                                    break;

                                }

                            }

                        }

                    }

                };

            }

        }

        return ret;

    }

    toString(): string {
        return this.toStringAux(0);
    }

    toStringAux(n: number): string {

        let s = '';
        for (let i = 0; i < n; i++) s = s + '   ';

        let ret = s + this._info + '\n';

        if (this._childs !== undefined) {

            this._childs.forEach(t => {

                ret += t.toStringAux(n + 1);

            });

        }

        return ret;

    }

    find(callback: (clonable: IClonable) => boolean): boolean {
        
        let ret = callback(this._info);

        if(!ret){

            for(var tree of this._childs){

                ret = tree.find(callback);

                if(!ret) return ret;

            }

        }

        return ret;

    }

}