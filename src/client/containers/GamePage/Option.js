import {OptionTypes} from './OptionTypes';

export default class DrawOption{
    type=OptionTypes.COLOR; //drawing
    value=null;
    constructor(type,value){
        this.type = type;
        this.value = value;
    }

    getType(){
        return this.type.toString();
    }

}
