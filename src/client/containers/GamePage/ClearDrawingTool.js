import React from 'react';
import { Box, IconButton, Typography, Button } from '@material-ui/core';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

const ClearDrawingTool = ({ socket, onToolClick }) => {
    function handleClick() {
        socket.emit('clearDrawing');
    }
    return (
        <Box display="flex" flexDirection="column" justifyContent="space-between" alignContent="center" alignItems="center" width={1}>
            <IconButton onClick={handleClick} color="primary" size="small">
                <DeleteForeverIcon fontSize="large"></DeleteForeverIcon>
            </IconButton>
            <Typography className="noselect" variant="caption">Clear</Typography>
        </Box>
    )
}

export default ClearDrawingTool;