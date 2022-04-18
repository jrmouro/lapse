import { IClonable } from "./clonable";
import { IFilter } from "./filter";

export interface IHow extends IFilter {
    builder(parent: IClonable, child: IClonable, level: number, leaf: boolean): IClonable[];
    direction(): boolean;
    continues(): boolean;
    divert(parent: IClonable, child: IClonable, level: number, leaf: boolean): boolean;
    result(info: IClonable, builderResult: IClonable): boolean;
    clone(): IHow;
}

export class How implements IHow {

    private nextAux: IHow | undefined;

    constructor(protected _next?: IHow, protected _direction: boolean = true) {

        this.nextAux = _next;

    }

    next(next?: IHow): IHow {

        if (next) this.nextAux = next;

        return this.nextAux;

    }

    filter(parent: IClonable, child: IClonable, level: number, leaf: boolean): IClonable  | undefined{

        let h = this.next();
        let c = child;

        while (h) {

            c = h.filter(parent, c, level, leaf);

            if( c === undefined){

                break;

            }

            if ('next' in h) {

                h = (<How>h).next();

            }

        }

        return c;

    }

    builder(parent: IClonable, child: IClonable, level: number, leaf: boolean): IClonable[] {
        
        let h = this.next();
        let c:IClonable[] = [];

        while (h) {

            c = h.builder(parent, child, level, leaf);

            if(c.length > 0){
                break;
            }

            if ('next' in h) {
                h = (<How>h).next();
            }

        }

        return c;
    }

    direction(): boolean {

        let h = this.next();
        let c = this._direction;

        while (h) {

            c = h.direction();

            if ('next' in h) {

                h = (<How>h).next();

            }

        }

        return c;

    }

    continues(): boolean {

        let h = this.next();
        let c = true;

        while (h) {

            c = h.continues();

            if(!c){

                break;

            }

            if ('next' in h) {

                h = (<How>h).next();

            }

        }

        return c;

    }

    divert(parent: IClonable, child: IClonable, level: number, leaf: boolean): boolean {

        let h = this.next();
        let c = false;

        while (h) {

            c = h.divert(parent, child, level, leaf);

            if (c) {

                break;

            }

            if ('next' in h) {

                h = (<How>h).next();

            }

        }

        return c;

    }

    result(info: IClonable, builderResult: IClonable): boolean {

        let h = this.next();
        let c = false;

        while (h) {

            c = h.result(info, builderResult);

            if (c) {

                break;

            }

            if ('next' in h) {
                h = (<How>h).next();
            }

        }

        return c;
    }

    clone(): IHow {

        return new How(this._next, this._direction);

    }

}