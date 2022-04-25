import { IBuilder } from "./builder";
import { IClonable } from "./clonable";

export interface IBuilderTree extends IClonable{
    builder(parent: Object, child: Object, builder:IBuilder): Object[];
    continues(): boolean;
    clone():IBuilderTree;
}

