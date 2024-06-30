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
import LoginForm from './LoginForm';
import QuickPlay from './QuickPlay';
const theme = createMuiTheme();
const GuestView = (props) => {
  
  
    return (

              <React.Fragment>
                <Grid container spacing={3} justify="center" alignItems="center">
                  <Grid item xs={12} sm={5}>
                      <QuickPlay />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Typography variant="h6" align="center">OR</Typography>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                          <LoginForm onLogin={props.onLogin} {...props} />
                  </Grid>
                </Grid>
              </React.Fragment>
    
           
      )
}

export default GuestView;