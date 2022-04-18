import { Tree } from "../tree";
import { ILapse, Lapse } from "./lapse";
import { _LapseHow } from "./lapseHow";
import { ILapseIntent } from "./lapseIntent";


export class LapseTree<T> extends Tree {

    constructor(root: ILapse<T>) {
        super(root);
    }

    add(lapse: ILapse<T> | ILapse<T>[], how: _LapseHow<T>, final: boolean = false, level: number = 0): ILapse<T>[] {

        return <ILapse<T>[]>super.add(lapse, how, final, level);

    }

}

export interface ILapseApplicationResultCallback<T> {

    result(lapseIntent: ILapseIntent<T>, result: ILapse<T>[], tree: LapseTree<T>): boolean;

}

export interface ILapseApplication<T> {

    run(
        root: Lapse<T> | LapseTree<T>,
        intents: ILapseIntent<T>[],
        callback: ILapseApplicationResultCallback<T>,
        order?: number[]): LapseTree<T>;

}

export class LapseApplication<T> implements ILapseApplication<T>{

    run(
        root: Lapse<T> | LapseTree<T>,
        intents: ILapseIntent<T>[],
        callback: ILapseApplicationResultCallback<T>,
        order?: number[]): LapseTree<T> {

        let tree: LapseTree<T>;

        if (root instanceof Lapse) {

            tree = new LapseTree(root.clone());

        } else {
            
            tree = root;
        }

        if (order !== undefined) {

            for (var index of order) {

                if (index >= 0 && index < intents.length) {

                    if (callback.result(
                        intents[index], 
                        tree.add(
                            intents[index].lapse,
                            intents[index].how,
                            intents[index].final,
                            0), 
                        tree)){ 

                            return tree;

                    }

                } else {

                    throw new Error('index order error')

                }

            }

        } else {

            for (var intent of intents) {

                if (callback.result(
                    intent, 
                    tree.add(
                        intent.lapse,
                        intent.how,
                        intent.final,
                        0), 
                    tree)){ 

                        return tree;

                }

            }

        }

        return tree;

    }

}