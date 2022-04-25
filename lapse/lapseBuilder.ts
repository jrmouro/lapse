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

// var lapseRef = new Lapse<string>('ref', 3, 3);
// var builder = new LapseBuilder<string>();
// console.log(builder.get(lapseRef).toString());