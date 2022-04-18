import { IClonable } from "./clonable";

export interface IIdentifiable<T> extends IClonable{
    id():T;
    clone():IIdentifiable<T>;
    toString():string;
}