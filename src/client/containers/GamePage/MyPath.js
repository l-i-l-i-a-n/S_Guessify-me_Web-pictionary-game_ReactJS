export default class MyPath{
    isCircle = false;
    id=0;
    points = [];
    color = "#000000";
    thickness = 1;
    time = 1; //default 1sec
    constructor(points, color, thickness, time,id, isCircle){
        this.points = points;
        this.color = color;
        this.thickness = thickness;
        this.time = time;
        this.id = id;
        this.isCircle = isCircle;
    }
}
