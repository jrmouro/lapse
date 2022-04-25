import { IBuilder } from "./builder";
import { IHow } from "./how";

export interface ITree {
    add(info: Object | Object[], how: IHow, final: boolean): Object[];
    toString(): string;
}

export class Tree implements ITree {

    constructor(protected _info: Object, private _builderInfo: IBuilder, private _final: boolean = false) { }
    protected _childs: Tree[] = [];

    add(child: Object | Object[], how: IHow, final: boolean = false): Object[] {
        return this.addAux(child, how, final, 0);
    }

    addAux(child: Object | Object[], how: IHow, final: boolean = false, level: number = 0): Object[] {

        let ret: Object[] = [];

        if (!this._final) {

            if (child instanceof Array) {

                child.forEach((i) => {

                    this.add(i, how.clone()).forEach((ii) => {

                        ret.push(ii);

                    })

                });

            } else {

                let filtered = how.filter(this._builderInfo.get(this._info), this._builderInfo.get(child), level, this._childs.length === 0);

                if (filtered) {

                    if (how.divert(this._builderInfo.get(this._info), this._builderInfo.get(child),level, this._childs.length === 0)) {

                        how.builder(this._builderInfo.get(this._info), this._builderInfo.get(child), this._builderInfo).forEach((resultChild) => {

                            if (how.result(this._builderInfo.get(child), this._builderInfo.get(resultChild))) {

                                ret.push(this._builderInfo.get(resultChild));

                                this._childs.push(new Tree(this._builderInfo.get(resultChild), this._builderInfo, final))

                            } else {

                                this._childs.push(new Tree(this._builderInfo.get(resultChild), this._builderInfo, this._final))

                            }

                        });

                    } else {

                        if (how.direction()) {

                            for (let index = 0; index < this._childs.length; index++) {

                                this._childs[index].addAux(this._builderInfo.get(filtered), how, final, level + 1).forEach((r) => {

                                    ret.push(r);

                                });

                                if (!how.continues()) {

                                    break;

                                }

                            }

                        } else {

                            for (let index = this._childs.length - 1; index >= 0; index--) {

                                this._childs[index].addAux(this._builderInfo.get(filtered), how, final, level + 1).forEach((r) => {

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

    find(callback: (clonable: Object) => boolean): boolean {

        let ret = callback(this._info);

        if (!ret) {

            for (var tree of this._childs) {

                ret = tree.find(callback);

                if (!ret) return ret;

            }

        }

        return ret;

    }

}