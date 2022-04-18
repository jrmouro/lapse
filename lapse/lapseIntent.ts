import { ILapse } from "./lapse";
import { _LapseHow } from "./lapseHow";

export interface ILapseIntent<T>{
    lapse:ILapse<T> | ILapse<T>[];
    how:_LapseHow<T>;
    final: boolean;
}