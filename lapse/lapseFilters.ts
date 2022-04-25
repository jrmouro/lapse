import { ILapse } from "./lapse";
import { ILapseFilterTree } from "./lapseFilter";

export abstract class LapseFilters<T> implements ILapseFilterTree<T>{

    constructor(protected filters: ILapseFilterTree<T>[] = []) { }

    abstract filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): boolean;
    abstract clone(): ILapseFilterTree<T>;
}

export class AndLapseFilters<T> extends LapseFilters<T>{

    constructor(filters: ILapseFilterTree<T>[] = []) {
        super(filters);
    }

    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): boolean {

        return !this.filters.some((f) => {

            if(!f.filter(parent, child, level, leaf)){

                return true;

            }

            return false;

        });

    }

    clone(): AndLapseFilters<T> {

        let filters: ILapseFilterTree<T>[] = [];

        this.filters.forEach((f) => {

            filters.push(f.clone());

        });

        return new AndLapseFilters<T>(filters);

    }

}

export class OrLapseFilters<T> extends LapseFilters<T>{

    constructor(filters: ILapseFilterTree<T>[] = []) {
        super(filters);
    }

    filter(parent: ILapse<T>, child: ILapse<T>, level: number, leaf: boolean): boolean{

        return this.filters.some((f) => {

            if(f.filter(parent, child, level, leaf)){

                return true;

            }

            return false;

        });

    }

    clone(): OrLapseFilters<T> {

        let filters: ILapseFilterTree<T>[] = [];

        this.filters.forEach((f) => {

            filters.push(f.clone());

        });

        return new OrLapseFilters<T>(filters);

    }

}



