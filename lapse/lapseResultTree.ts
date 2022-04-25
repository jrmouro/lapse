import { IResultTree } from "../tree/result_tree";
import { ILapse } from "./lapse";

export interface ILapseResultTree<T> extends IResultTree{
    result(intent: ILapse<T>, result: ILapse<T>): boolean;
    clone(): ILapseResultTree<T>;
}

export class LapseResultTree<T> implements ILapseResultTree<T>{
    
    result(intent: ILapse<T>, result: ILapse<T>): boolean {
        return intent.id() === result.id();
    }

    clone(): ILapseResultTree<T> {
        throw new Error("Method not implemented.");
    }

}