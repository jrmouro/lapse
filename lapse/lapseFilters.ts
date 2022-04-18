import { ILapse } from "./lapse";
import { _LapseFilter } from "./lapseFilter";

export abstract class LapseFilters<T> extends _LapseFilter<T>{

    constructor(protected filters: _LapseFilter<T>[] = []) {
        super();
    }

    abstract filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): ILapse<T> | undefined;
    abstract clone(): LapseFilters<T>;
}

export class CascadingLapseFilters<T> extends LapseFilters<T>{

    constructor(filters: _LapseFilter<T>[] = []) {
        super(filters);
    }

    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): ILapse<T> | undefined {

        let aux: ILapse<T> | undefined = child;

        this.filters.some((f) => {

            aux = f.filter(parent, aux!, level, leaf);

            if (aux === undefined) {

                return true;

            }

            return false;

        });

        return aux;

    }

    clone(): CascadingLapseFilters<T> {

        let filters: _LapseFilter<T>[] = [];

        this.filters.forEach((f) => {

            filters.push(f.clone());

        });

        return new CascadingLapseFilters<T>(filters);

    }

}

export class AndLapseFilters<T> extends LapseFilters<T>{

    constructor(filters: _LapseFilter<T>[] = []) {
        super(filters);
    }

    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): ILapse<T> | undefined {

        let aux: ILapse<T> | undefined = child;

        this.filters.some((f) => {

            aux = f.filter(parent, child, level, leaf);

            if (aux === undefined) {

                return true;

            }

            return false;

        });

        return aux;

    }

    clone(): AndLapseFilters<T> {

        let filters: _LapseFilter<T>[] = [];

        this.filters.forEach((f) => {

            filters.push(f.clone());

        });

        return new AndLapseFilters<T>(filters);

    }

}

export class OrLapseFilters<T> extends LapseFilters<T>{

    constructor(filters: _LapseFilter<T>[] = []) {
        super(filters);
    }

    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): ILapse<T> | undefined {

        let aux: ILapse<T> | undefined = child;

        this.filters.some((f) => {

            aux = f.filter(parent, child, level, leaf);

            if (aux !== undefined) {

                return true;

            }

            return false;

        });

        return aux;

    }

    clone(): OrLapseFilters<T> {

        let filters: _LapseFilter<T>[] = [];

        this.filters.forEach((f) => {

            filters.push(f.clone());

        });

        return new OrLapseFilters<T>(filters);

    }

}



