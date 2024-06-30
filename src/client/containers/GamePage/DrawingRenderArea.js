/********************************************************************/
/********************************************************************/
/* IMPORTANT : CE COMPOSANT EST OBSOLETE : NE PAS MODIFIER CE COMPOSANT, MODIFIER RenderAreaV2 A LA PLACE
/********************************************************************/
/********************************************************************/

















import React, { useRef, useEffect, useReducer } from 'react';
import './style.css';
import { Paper, Grid, Box, Container, LinearProgress, Typography, AppBar, Tabs, Tab, Divider, Switch, TextField, ListItemSecondaryAction } from '@material-ui/core';
import MyPath from './MyPath';

var path;
var ancienTemps = Date.now();
var pathsArray = [];
class Point { x = 0; y = 0; }
var isRendering = false;

const DrawingRenderArea = ({ socket }) => {
    //liste de paths qui sont actuellement affichés à l'écran 
    const [listPath, setListPath] = React.useState([]);
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
    const [thickness, setThickness] = React.useState(30);


    /************************************
     * (Hook version of "componentDidMount" lifecycle method)
     * **
     * This effect is executed only once : after the component has mounted
     */
    const [componentIsMounted, setComponentIsMounted] = React.useState(false);
    React.useEffect(() => {
        setComponentIsMounted(true);
        console.log("DrawingRenderArea MOUNTED");
        
        // Sets the initial drawing area size
        const w = document.getElementById('svgArea').clientWidth;
        const h = w / 1168 * 617.817;
        setSvgBoxWidth(w);
        setSvgBoxHeight(h);
        console.log("yo : " + svgBoxHeight);
    }, []);
    /************************************/
    /************************************
     * Handles the drawing clear effect
     * **
     * Sets listPath empty
     * Sets clearer in gamePage to false (via handleAfterClear)
     */
    React.useEffect(() => {
        console.log("------------------------------------------------------------");
        if (socket == null) return;
        socket.on('clearDrawing', () => {
            console.log("CLEARING DrawingRenderArea");
            if (!componentIsMounted) return;
            setListPath([]);
        });
    }, [socket]);
    /************************************/

    useEffect(() => {
        if (socket == null) return;
        socket.on('drawCmd', async function (data) {
            pathsArray = [...pathsArray, data];
            console.log("//////// VIEWER DATA : " + JSON.stringify(data));
            setListPath(path => {
                if (path.length == 0 || path[path.length - 1].id != data.id) {
                    if (path.length != 0) console.log("adding new Path : " + path[path.length - 1].id + " : " + data.id);
                    return [...path, new MyPath([], data.color, data.thickness, data.time, data.id)];

                }
                else {
                    console.log("NOT adding new Path : " + path[path.length - 1].id + " : " + data.id);
                    return [...path];

                }
            });

            if (!isRendering)
                await displayPathsArray();
            else
                console.log("IS RENDERING : TRUE");
        });
    }, [socket]);

    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    const fctQuiAjouteUnParUn = (myPath) => {

        var { x, y } = myPath.points.shift();
        setListPath(listpath => {
            if (listpath.length === 0) return [];
            listpath[listpath.length - 1].points.push({ x, y });
            return listpath;
        });
        forceUpdate();

    }

    const displayPathsArray = async () => {
        isRendering = true;
        while (pathsArray.length > 0) {
            let time = pathsArray[0].time;
            let nbPoints = pathsArray[0].points.length;
            for (var i = 0; i < nbPoints; i++) {
                fctQuiAjouteUnParUn(pathsArray[0]);

                await sleep((time * 1000) / nbPoints);

            }
            pathsArray.shift();
        }
        isRendering = false;
    }

    // The smoothing ratio
    const smoothing = 0.2

    // Properties of a line 
    // I:  - pointA (array) [x,y]: coordinates
    //     - pointB (array) [x,y]: coordinates
    // O:  - (object) { length: l, angle: a }: properties of the line
    const line = (pointA, pointB) => {
        const lengthX = pointB.x - pointA.x
        const lengthY = pointB.y - pointA.y
        return {
            length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
            angle: Math.atan2(lengthY, lengthX)
        }
    }

    // Position of a control point 
    // I:  - current (array) [x, y]: current point coordinates
    //     - previous (array) [x, y]: previous point coordinates
    //     - next (array) [x, y]: next point coordinates
    //     - reverse (boolean, optional): sets the direction
    // O:  - (array) [x,y]: a tuple of coordinates
    const controlPoint = (current, previous, next, reverse) => {
        // When 'current' is the first or last point of the array
        // 'previous' or 'next' don't exist.
        // Replace with 'current'
        const p = previous || current;
        const n = next || current;

        // Properties of the opposed-line
        const o = line(p, n);

        // If is end-control-point, add PI to the angle to go backward
        const angle = o.angle + (reverse ? Math.PI : 0);
        const length = o.length * smoothing;

        // The control point position is relative to the current point
        const x = current.x + Math.cos(angle) * length;
        const y = current.y + Math.sin(angle) * length;
        return [x, y];
    }

    // Create the bezier curve command 
    // I:  - point (array) [x,y]: current point coordinates
    //     - i (integer): index of 'point' in the array 'a'
    //     - a (array): complete array of points coordinates
    // O:  - (string) 'C x2,y2 x1,y1 x,y': SVG cubic bezier C command
    const bezierCommand = (point, i, a) => {

        // start control point
        const cps = controlPoint(a[i - 1], a[i - 2], point)

        // end control point
        const cpe = controlPoint(point, a[i - 1], a[i + 1], true)
        return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point.x},${point.y}`
    }

    // Render the svg <path> element 
    // I:  - points (array): points coordinates
    //     - command (function)
    //       I:  - point (array) [x,y]: current point coordinates
    //           - i (integer): index of 'point' in the array 'a'
    //           - a (array): complete array of points coordinates
    //       O:  - (string) a svg path command
    // O:  - (string): a Svg <path> element
    const svgPath = (points, command) => {
        // build the d attributes by looping over the points
        const d = points.reduce((acc, point, i, a) => i === 0
            ? `M ${point.x},${point.y}`
            : `${acc} ${command(point, i, a)}`
            , '')
        return `${d}`
    }

    const [svgBoxWidth, setSvgBoxWidth] = React.useState(0);
    const [svgBoxHeight, setSvgBoxHeight] = React.useState(0);
    window.onresize = () => {
        const oldWidth = svgBoxWidth;
        const oldHeight = svgBoxHeight;
        const newWidth = document.getElementById('svgArea').clientWidth;
        const newHeight = newWidth / 1168 * 617.817;
        setSvgBoxWidth(newWidth);
        setSvgBoxHeight(newHeight);
    }

    return (
        <Box mt={1} height={svgBoxHeight}>
            <Paper className="fullHeight">
                <CanvasDraw ref={canvasDraw => (drawingZoneRef.current = canvasDraw)} id="canvas-id" className="drawingArea" brushColor={brushColor} brushRadius={brushSize} canvasWidth={svgBoxWidth} canvasHeight={svgBoxHeight} />
            </Paper>
        </Box>
    );
}


/*
<svg
                    id="mySvg"
                    className="drawingRenderArea"
                    viewBox={`0 0 ${1168} ${617.817}`}
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    version="1.1"
                    baseProfile="full"
                    preserveAspectRatio="xMidYMid">
                    {
                        listPath.map((MyPath, index) => <path d={svgPath(MyPath.points, bezierCommand)} key={index} fill="none" stroke={MyPath.color} strokeWidth={MyPath.thickness} strokeLinecap="round"></path>)
                    }
                </svg>



*/
export default DrawingRenderArea;