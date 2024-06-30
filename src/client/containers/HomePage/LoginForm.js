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
import { useSnackbar } from 'material-ui-snackbar-provider'
const LoginForm = (props) => {
    const [usernameM, setUsernameM] = useState('');
    const [passwordM, setPasswordM] = useState('');
    const snackBar = useSnackbar()
    const tryConnect = async () => {
        console.log(usernameM, passwordM)
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: usernameM, password: passwordM }),
        });
        if (response.ok) {
          var data = await response.json();
          snackBar.showMessage("Logged in")
          props.onLogin(data.msg)
        }
        else {
          snackBar.showMessage("Invalid crdentials. Please verify your credentials")
        }
      }


        
      /**
   * Functions to handle "enter" key press (instead of clicking on the button)
   * @param {*} e 
   */

  const toConnectButton = (e) => {
    if (e.key === 'Enter') {
      event.preventDefault(); //prevents from reloading homepage
      document.getElementById("logInButton").click();
    }
  }
    return (<React.Fragment>
        <Typography component="h1" variant="h5" align="center" color="primary">Sign in</Typography>
        <Grid container spacing={2} justify="center" id="OtherConnections" style={{ marginTop: 10 }}>
          <Grid item title="Connect with Google">
            <Fab size="medium" color="primary" aria-label="add">
              <SvgIcon>
                <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
              </SvgIcon>
            </Fab>
          </Grid>
          <Grid item title="Connect with Twitter">
            <Fab size="medium" color="primary" aria-label="add">
              <SvgIcon>
                <path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z" />
              </SvgIcon>
            </Fab>
          </Grid>
          <Grid item title="Connect with Facebook">
            <Fab size="medium" color="primary" aria-label="add">
              <SvgIcon>
                <path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M18,5H15.5A3.5,3.5 0 0,0 12,8.5V11H10V14H12V21H15V14H18V11H15V9A1,1 0 0,1 16,8H18V5Z" />
              </SvgIcon>
            </Fab>
          </Grid>
        </Grid>
        <Box mb="10px">
          <form onKeyDown={e => toConnectButton(e)}>
            <TextField
              style={{ marginTop: 10, marginBottom: 10 }}
              id="UsernameM"
              name="username"
              label="Username"
              fullWidth
              autoComplete="fname"
              value={usernameM}
              onChange={e => setUsernameM(e.target.value)}
            />
            <TextField
              style={{ marginTop: 10, marginBottom: 10 }}
              id="PasswordM"
              name="password"
              label="Password"
              type="password"
              fullWidth
              autoComplete="fname"
              value={passwordM}
              onChange={e => setPasswordM(e.target.value)}
            />
          </form>
          <Button onClick={tryConnect} id="logInButton" variant="contained" size="medium" color="primary" fullWidth>Sign in</Button>
          <Typography variant="subtitle1" style={{ marginTop: 10, marginBottom: 10 }} align="center">
            Not a member? <Link to="/signup">Register</Link>
          </Typography>
        </Box>
      </React.Fragment>)
}

export default LoginForm;