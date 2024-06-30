import React from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { Box } from '@material-ui/core';
import { spacing } from '@material-ui/system';
import grey from '@material-ui/core/colors/grey';
const primary = grey[300];


export default function WordList() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      spacing={15}
    >
      <Button>1er mot</Button>
      <Button>2eme mot</Button>
      <Button>3eme mot</Button>
    </Box>
  );
}