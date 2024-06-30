import React from 'react';
import { Icon, InlineIcon } from '@iconify/react';
import eraserIcon from '@iconify/icons-mdi/eraser';
import brushIcon from '@iconify/icons-mdi/brush';
import { Button, IconButton, Box, Typography } from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

/**
 * hexToRgb function
 * **
 * @description
 * Takes a hex color value and returns the corresponding (red green blue) values in an object
 * **
 * @param hex A hex color value
 */
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * SwitchBrushModeTool component
 * **
 * @PROPS
    * @param brushColor
    * @param brushMode
    * @param setBrushMode Function
 */
const SwitchBrushModeTool = ({ setBrushColor,brushColor, brushMode, setBrushMode, rgbBrushColor }) => {

    /**
     * Styling utils
     */
    //const BRUSH_COLOR_RGB = hexToRgb(brushColor);
    const useStyles = makeStyles({
        modeSelected: {
            backgroundColor: `rgba(${rgbBrushColor.r}, ${rgbBrushColor.g}, ${rgbBrushColor.b},0.3)`,
            borderRadius: '25%',
            pointerEvents: 'none',
        },
    });
    const classes = useStyles();
    /** */

    const onDrawModeClick = () => {
        if (brushMode !== 'Draw'){
            setBrushMode('Draw');
        }
    }

    const onEraseModeClick = () => {
        if (brushMode !== 'Erase'){
            setBrushMode('Erase');
            //setBrushColor('#FFFFFF');
        }
        
    }

    return (
        <Box display="flex" flexDirection="column" justifyContent="space-between" alignContent="center" alignItems="center" width={1}>
            <Box display="flex" flexDirection="column">
                <IconButton onClick={onDrawModeClick} size="small" className={brushMode === 'Draw' ? classes.modeSelected : null}>
                    <Icon icon={brushIcon} color={brushColor} width="2em" />
                </IconButton>
                <IconButton onClick={onEraseModeClick} size="small" className={brushMode === 'Erase' ? classes.modeSelected : null}>
                    <Icon icon={eraserIcon} color="grey" width="2em" />
                </IconButton>
            </Box>
            <Typography className="noselect" variant="caption">Mode</Typography>
        </Box>
    )
}

export default SwitchBrushModeTool;