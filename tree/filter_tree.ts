import { IClonable } from "./clonable";

export interface IFilterTree extends IClonable {
    filter(parent: Object, child: Object, level:number, leaf: boolean): boolean;
    clone(): IFilterTree;
}

export class LevelFilterTree implements IFilterTree {
    
    private _level: number = -1;
    private _previousLevel: number = -1;

    constructor(protected maxLevel?:number){}

    filter(parent: Object, child: Object, level:number): boolean {

        if(this.maxLevel && level > this.maxLevel)return true;

        this._previousLevel = this._level;
        this._level = level;

        return true;

    }

    backtrack():boolean{
        return this._previousLevel > this._level;
    }

    clone(): IFilterTree {
        return new LevelFilterTree();
    }

    

}

export class AddFilterTree implements IFilterTree {

    constructor(protected filters: IFilterTree[]) { }

    filter(parent: Object, child: Object, level:number, leaf: boolean): boolean {

        return !this.filters.some((f) => {

            return !f.filter(parent, child, level, leaf);

        });

    }

    clone(): IFilterTree {

        let filters: IFilterTree[] = [];

        this.filters.forEach((f) => {

            filters.push(f.clone());

        });

        return new AddFilterTree(filters);

    }

} 

export class OrFilterTree implements IFilterTree {

    constructor(protected filters: IFilterTree[]) { }

    filter(parent: Object, child: Object, level:number, leaf: boolean): boolean {

        return this.filters.some((f) => {

            return f.filter(parent, child, level, leaf);

        });

    }

    clone(): IFilterTree {

        let filters: IFilterTree[] = [];

        this.filters.forEach((f) => {

            filters.push(f.clone());

        });

        return new OrFilterTree(filters);

    }

} 