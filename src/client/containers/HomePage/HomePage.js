import React from 'react';
import { useState } from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Fab from '@material-ui/core/Fab'
import TextField from '@material-ui/core/TextField';
import { createMuiTheme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import SvgIcon from '@material-ui/core/SvgIcon';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';

import useMediaQuery from '@material-ui/core/useMediaQuery';
import GuestView from './GuestView';
import UserView from './UserView';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import TemplatePage from '../TemplatePage';


function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}






/*
 * HomePage component
 *
 * This is the first thing users see of our App, at the '/' route
 */
const HomePage = (props) => {


  const [user, setUser] = useState(null);


  

  

 

  return (
   <TemplatePage>
   {user ? (<UserView user={user} onLogout={() => setUser(null)} />):(<GuestView onLogin={(user) => setUser(user)} />) }
   </TemplatePage>)
}

export default HomePage;