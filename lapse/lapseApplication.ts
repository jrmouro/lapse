import { ILapse, Lapse } from "./lapse";
import { ILapseIntent } from "./lapseIntent";
import {LapseTree } from "./lapseTree";

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

            tree = new LapseTree(new BuilderLapse<T>().get(root));

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