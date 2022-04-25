import { IBuilder } from "../tree/builder";
import { ILapse, Lapse } from "./lapse";

export interface ILapseBuilder<T> extends IBuilder{
    get(ref :ILapse<T>): ILapse<T>;
}

export class LapseBuilder<T> implements ILapseBuilder<T>{
    
    get(ref :ILapse<T>): ILapse<T> {
        return new Lapse(ref.id(), ref.start(), ref.len());
    }

}