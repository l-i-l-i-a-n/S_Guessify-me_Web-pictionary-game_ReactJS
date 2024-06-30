import React from 'react';
import { useState } from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import {Select, MenuItem,InputLabel,FormControl} from '@material-ui/core'
import Fab from '@material-ui/core/Fab'
import TextField from '@material-ui/core/TextField';
import { createMuiTheme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import SvgIcon from '@material-ui/core/SvgIcon';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';

const UserView = ({user,onLogout}) => {
  async function disconnect() {
    const response = await fetch('/api/auth/logout')
    if (response.ok) {
      var data = await response.json();
      onLogout();
    }
    else {
    }
  }
  const [selectedLang, setSelectedLang] = useState('en-US');
    return (<React.Fragment>
        <Typography variant="h4" align="left">
          Welcome back, {user.username}!
        </Typography>
        <Typography variant="body1" align="left">
          You currently have {user.pointTotal} points
        </Typography>
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
        <Link to={{ pathname: '/game', state: { username: user.username, accountID: user._id , lang:selectedLang} }}>
    <Button id="guestPlayRedirectLink" variant="contained" size="medium" color="primary" fullWidth>Play</Button>
    </Link>
        <Button onClick={disconnect}>Deconnexion</Button>
      </React.Fragment>)
}

export default UserView;