import React from 'react';
import { useState } from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Fab from '@material-ui/core/Fab'
import {Select, MenuItem,InputLabel,FormControl} from '@material-ui/core'
import TextField from '@material-ui/core/TextField';
import { createMuiTheme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import SvgIcon from '@material-ui/core/SvgIcon';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import useMediaQuery from '@material-ui/core/useMediaQuery';
const QuickPlay = (props) => {
    const [usernameAnonymous, setUsernameAnonymous] = useState('');
    const [selectedLang, setSelectedLang] = useState('en-US');
    return (
    <React.Fragment>
 <Typography component="h1" variant="h5" align="center" color="primary">Quick play</Typography>
    <TextField
      style={{ marginTop: 10, marginBottom: 10 }}
      id="usernameGuest"
      name="username"
      label="Username"
      value={usernameAnonymous}
      onChange={e => setUsernameAnonymous(e.target.value)}
      fullWidth
      autoComplete="fname"
    />
    <FormControl>
        <InputLabel >Language</InputLabel>
        <Select
          value={selectedLang}
          onChange={(e)=> setSelectedLang(e.target.value)}
        >
          <MenuItem value={"en-US"}>English</MenuItem>
          <MenuItem value={"fr-FR"}>French</MenuItem>
        </Select>
      </FormControl>
    <Link to={{ pathname: '/game', state: { username: usernameAnonymous,lang:selectedLang } }}>
    
      <Button id="guestPlayRedirectLink" variant="contained" size="medium" color="primary" fullWidth>Play</Button>
      
      
    </Link>
    </React.Fragment>
   )
}

export default QuickPlay