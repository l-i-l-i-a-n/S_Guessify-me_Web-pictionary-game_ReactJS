import React from 'react';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import { Box, IconButton, Typography, TextField } from '@material-ui/core';

/**
 * brush size utils
 */
const BRUSH_SIZE_MAX = 200;
const BRUSH_SIZE_STEP = 1;
const BRUSH_SIZE_MIN = 1;
/** */

/**
 * setTimeout utils
 */
const CHANGE_INTERVAL_INITIAL = 400;
const CHANGE_INTERVAL_STEP = 100;
const CHANGE_INTERVAL_MIN = 20;
var timer;
var changeInterval = CHANGE_INTERVAL_INITIAL;
/** */

/**
 * SizingTool component
 * **
 * @PROPS
    * @param brushSize
    * @param setBrushSize Function
 */
const SizingTool = ({ brushSize, setBrushSize }) => {
  const localBrushSize = React.useRef(brushSize);

  const updateChangeInterval = (valueOff) => {
    if (changeInterval !== CHANGE_INTERVAL_MIN) {
      changeInterval > CHANGE_INTERVAL_MIN ? changeInterval -= valueOff : changeInterval = CHANGE_INTERVAL_MIN;
    }
  }

  const updateBrushSize = (value) => {
    setBrushSize(brushSize => brushSize + value);
    localBrushSize.current += value;
  }

  const runClickPlus = () => {
    localBrushSize.current < BRUSH_SIZE_MAX ? updateBrushSize(BRUSH_SIZE_STEP) : null;
    timer = setTimeout(runClickPlus, changeInterval);
    updateChangeInterval(CHANGE_INTERVAL_STEP);
  }

  const runClickMinus = () => {
    localBrushSize.current > BRUSH_SIZE_MIN ? updateBrushSize(-BRUSH_SIZE_STEP) : null;
    timer = setTimeout(runClickMinus, changeInterval);
    updateChangeInterval(CHANGE_INTERVAL_STEP);
  }
  const stopClick = () => {
    clearTimeout(timer);
    changeInterval = CHANGE_INTERVAL_INITIAL;
  }

  const onInputChange = (event) => {
    const val = parseInt(event.target.value, 10);
    if (Number.isSafeInteger(val)) {
      if (val <= BRUSH_SIZE_MAX && val >= BRUSH_SIZE_MIN) {
        setBrushSize(val);
        localBrushSize.current = val;
      }
      else if (val > BRUSH_SIZE_MAX) {
        setBrushSize(BRUSH_SIZE_MAX);
        localBrushSize.current = BRUSH_SIZE_MAX;
      }
      else if (val < BRUSH_SIZE_MIN) {
        setBrushSize(BRUSH_SIZE_MIN);
        localBrushSize.current = BRUSH_SIZE_MIN;
      }
    }
  }

  const setSelect = (event) => {
    event.target.select();
  }

  return (
    <Box display="flex" flexDirection="column" justifyContent="space-between" alignContent="center" alignItems="center" width={1} onMouseOut={stopClick}>
      <Box display="flex" flexDirection="column-reverse">
        <IconButton onMouseDown={runClickMinus} onMouseUp={stopClick} color="primary" size="small">
          <RemoveCircleIcon fontSize="large"></RemoveCircleIcon>
        </IconButton>
        <Box marginTop={1} marginBottom={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <TextField
            className="brushSizeInput"
            value={brushSize}
            variant="standard"
            onChange={onInputChange}
            onFocus={setSelect}
          />
        </Box>
        <IconButton onMouseDown={runClickPlus} onMouseUp={stopClick} color="primary" size="small">
          <AddCircleIcon fontSize="large"></AddCircleIcon>
        </IconButton>
      </Box>
      <Typography className="noselect" variant="caption">Size</Typography>
    </Box>
  );
}

export default SizingTool;