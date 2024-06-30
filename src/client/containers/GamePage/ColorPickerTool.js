import React from 'react';
import { OptionTypes } from './OptionTypes';
import { Box, Typography } from '@material-ui/core';
import { HuePicker, SketchPicker } from 'react-color';
import BlackWhiteColorPicker from './BlackWhiteColorPicker';
import reactCSS from 'reactcss'
import GuessifyColorPicker from './GuessifyColorPicker';

const ColorPickerTool = ({ brushColor, setBrushColor, setBrushMode, setRgbBrushColor, oldColors, setOldColors }) => {

    const handleColorChange = (color) => {
        //setBrushColor(`rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`);
        setBrushColor(color.hex);
        setBrushMode('Draw');
        setRgbBrushColor({ r: color.rgb.r, g: color.rgb.g, b: color.rgb.b });
    }

    return (
        <Box display="flex" flexDirection="column" justifyContent="space-between" alignContent="center" alignItems="center" height="4em" width={1}>
            <Box display="flex" flexDirection="row" width={1} height={1}>
                {/*<HuePicker
                disableAlpha={true}
                    item
                    xs={1}
                    color={brushColor}
                    onChangeComplete={handleColorChange}
                />*/}
                <GuessifyColorPicker
                    color={brushColor}
                    onChange={handleColorChange}
                    oldColors={oldColors}
                    brushColor={brushColor} />
            </Box>
            {/*<Typography variant="caption">Brush color</Typography>*/}
        </Box>
    );
}

export default ColorPickerTool;