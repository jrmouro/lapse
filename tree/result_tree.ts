import { IClonable } from "./clonable";

export interface IResultTree extends IClonable{
    result(intent: Object, result: Object): boolean
    clone():IResultTree;
}