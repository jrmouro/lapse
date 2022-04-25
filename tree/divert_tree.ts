import { IClonable } from "./clonable";

export interface IDivertTree extends IClonable {
    divert(parent: Object, child: Object, level:number, leaf:boolean): boolean;
    clone(): IDivertTree;
}