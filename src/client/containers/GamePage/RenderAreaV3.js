import React, { useRef, useEffect, useReducer } from 'react';
import './style.css';
import { Paper, Box } from '@material-ui/core';

import DrawingComponentV2 from './DrawingComponentV2';

const RenderAreaV3 = (props) => {
    const drawingZoneRef = React.useRef(null);
    /****************************************************************************/
    /****************************************************************************/
    /* SVG AREA SIZING UTILS
     *
     * Used to initialize and update responsive svg area size (height)
     */
    const [svgBoxHeight, setSvgBoxHeight] = React.useState(0);
    const [svgBoxWidth, setSvgBoxWidth] = React.useState(0);
    /**
     * (Hook version of "componentDidMount" lifecycle method)
     * **
     * This effect is executed only once : after the component has mounted
     * **
     * Sets the initial drawing area size
     */
    React.useEffect(() => {
        console.log("DrawingRenderArea MOUNTED");
        // Sets the initial drawing area size
        const w = document.getElementById('svgArea').clientWidth;
        const h = w / 1060 * 582;
        setSvgBoxHeight(h);
        setSvgBoxWidth(w);
    }, []);

    /**
     * Updates drawing area size on resize event
     */
    window.onresize = () => {
        const newWidth = document.getElementById('svgArea').clientWidth;
        const newHeight = newWidth / 1060 * 582;
        setSvgBoxHeight(newHeight);
        setSvgBoxWidth(newWidth);
    }
    /****************************************************************************/


    return (
        <Box height={svgBoxHeight}>
            <Paper>
                <DrawingComponentV2 ref={canvasDraw => props.drawingRef.current=canvasDraw} disabled={true} id="canvas-id" className="drawingRenderArea" canvasWidth={svgBoxWidth} canvasHeight={svgBoxHeight} hideGrid={true} />
            </Paper>
        </Box>
    );
}

export default RenderAreaV3;
