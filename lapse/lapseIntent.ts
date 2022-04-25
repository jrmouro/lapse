import { ILapse } from "./lapse";
import { ILapseHow } from "./lapseHow";

export interface ILapseIntent<T> {
    lapse: ILapse<T> | ILapse<T>[];
    how: ILapseHow<T>;
    final: boolean;
}