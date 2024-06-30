import React from 'react';
import ClearDrawingTool from './ClearDrawingTool';
import SizingTool from './SizingTool';
import SwitchBrushModeTool from './SwitchBrushModeTool';
import ColorPickerTool from './ColorPickerTool';
import { Paper, Box, Grid, Divider } from '@material-ui/core';

const DrawingToolsVertical = ({ socket, brushSize, setBrushSize, brushColor, setBrushColor, rgbBrushColor, setRgbBrushColor, brushMode, setBrushMode }) => {
    return (
        <Paper>
            <Box m={1} height={1} minWidth="42px" display="flex" flexDirection="column" justifyContent="start">
                <SwitchBrushModeTool socket={socket} setBrushColor={setBrushColor} brushColor={brushColor} brushMode={brushMode} setBrushMode={setBrushMode} rgbBrushColor={rgbBrushColor} />
                <Box my={1}>
                    <Divider/>
                </Box>
                <SizingTool brushSize={brushSize} setBrushSize={setBrushSize} />
                <Box my={1}>
                    <Divider/>
                </Box>
                <ClearDrawingTool socket={socket} />
            </Box>
        </Paper>
    )
}

export default DrawingToolsVertical;