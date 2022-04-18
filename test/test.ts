import { Tree } from "../tree";

var tree = {s:1, l:3, e:function(){return this.s + this.l}}
var copy = {... tree}
copy.s = 5;

console.log(tree.e());
console.log(copy.e());

export interface teste{
    start:number,
    len:number
}

export interface end{
    (t:teste):number;
}

var e:end = (t:teste)=>{ return t.start + t.len; }