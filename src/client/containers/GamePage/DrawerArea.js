import React from 'react';
import DrawingAreaV2 from './DrawingAreaV2';
import DrawingToolsVertical from './DrawingToolsVertical';
import { Box } from '@material-ui/core';
import DrawingToolsHorizontal from './DrawingToolsHorizontal';

const MAX_OLD_COLORS = 10;

const DrawerArea = ({ socket }) => {
    const [brushSize, setBrushSize] = React.useState(10);
    const [brushColor, setBrushColor] = React.useState("#1266db");
    const [oldColors, setOldColors] = React.useState([brushColor]);
    const [rgbBrushColor, setRgbBrushColor] = React.useState({ r: 18, g: 102, b: 219 });
    const [brushMode, setBrushMode] = React.useState("Draw"); // 'draw' || 'erase'
    const [brushShape, setBrushShape] = React.useState("round"); // WIP (circle, rectangle, etc. ?)

    const updateOldColors = () => {
        if (!oldColors.includes(brushColor)) {
            setOldColors(oldColors => {
                if (oldColors.length < MAX_OLD_COLORS) {
                    return [...oldColors, brushColor];
                }
                else {
                    const arrTemp = oldColors;
                    arrTemp.shift();
                    arrTemp.push(brushColor);
                    console.log(arrTemp.length);
                    return arrTemp;
                }
            });
        }
    }

    return (
        <Box display="flex" flexDirection="row">
            <DrawingToolsVertical
                socket={socket}
                brushSize={brushSize} setBrushSize={setBrushSize}
                brushColor={brushColor} setBrushColor={setBrushColor} rgbBrushColor={rgbBrushColor} setRgbBrushColor={setRgbBrushColor}
                brushMode={brushMode} setBrushMode={setBrushMode}
            />
            <Box ml={1} display="flex" height={1} flexDirection="column" flexGrow="1" id="svgArea">
                <DrawingAreaV2
                    socket={socket}
                    brushSize={brushSize}
                    brushColor={brushColor}
                    brushMode={brushMode}
                    updateOldColors={updateOldColors}
                />
                <DrawingToolsHorizontal
                    socket={socket}
                    brushSize={brushSize} setBrushSize={setBrushSize}
                    brushColor={brushColor} setBrushColor={setBrushColor} rgbBrushColor={rgbBrushColor} setRgbBrushColor={setRgbBrushColor}
                    brushMode={brushMode} setBrushMode={setBrushMode}
                    oldColors={oldColors} setOldColors={setOldColors}
                />
            </Box>
        </Box>
    );
}

export default DrawerArea;