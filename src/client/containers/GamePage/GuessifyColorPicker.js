import React from 'react';

import { CustomPicker, CirclePicker } from 'react-color';
import { Hue, Saturation } from 'react-color/lib/components/common';
import GuessifyPointer from './GuessifyPointer';
import { Box, Typography } from '@material-ui/core';
import GuessifySliderPointer from './GuessifySliderPointer';

import { Icon, InlineIcon } from '@iconify/react';
import checkboxBlank from '@iconify/icons-mdi/checkbox-blank';

export const GuessifyColorPicker = ({ hsv, rgb, hsl, onChange, oldColors, brushColor }) => {
    return (
        <Box width={1} height={1} display="flex">
            <Box position="relative" width={0.2} height={1} className="slider">
                <Saturation
                    hsv={hsv}
                    rgb={rgb}
                    hsl={hsl}
                    onChange={onChange}
                    pointer={GuessifyPointer}
                />
            </Box>
            <Box mr={1}></Box>
            <Box width={0.8} height={1} display="flex" flexDirection="column" justifyContent="space-between" alignContent="center" alignItems="center">
                <Box position="relative" width={1} height="25px" display="flex" alignItems="center">
                    <Typography className="noselect" variant="caption">Color history: </Typography>
                    <Box flexGrow={1} ml={1}>
                        <CirclePicker
                            hsv={hsv}
                            rgb={rgb}
                            hsl={hsl}
                            onChange={onChange}
                            pointer={GuessifySliderPointer}
                            circleSize={25}
                            width="70%"
                            colors={oldColors} />
                    </Box>
                </Box>
                <Box display="flex" width={1}>
                    <Box position="relative" width={1} height="30px" className="slider">
                        <Hue
                            hsv={hsv}
                            rgb={rgb}
                            hsl={hsl}
                            onChange={onChange}
                            pointer={GuessifySliderPointer} />
                    </Box>
                    <Box ml={1} className="currentColorIcon">
                        <Icon icon={checkboxBlank} color={brushColor} width="2.5em" />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default CustomPicker(GuessifyColorPicker);
