import { IClonable } from "./clonable";

export interface IFilter extends IClonable {
    filter(parent: IClonable, child: IClonable, level: number, leaf: boolean): IClonable | undefined;
    clone(): IFilter;
}

export class Filter implements IFilter{

    constructor(protected filters:IFilter[]){}
    
    filter(parent: IClonable, child: IClonable, level: number, leaf: boolean): IClonable {

        let aux = child;

        this.filters.some((f)=>{

            aux = f.filter(parent, aux, level, leaf);

            if(aux === undefined){

                return true;

            }

            return false;

        });

        return aux;

    }

    clone(): IFilter {

        let filters:IFilter[] = [];

        this.filters.forEach((f)=>{

            filters.push(f.clone());

        });

        return new Filter(filters);
    }
    
} 