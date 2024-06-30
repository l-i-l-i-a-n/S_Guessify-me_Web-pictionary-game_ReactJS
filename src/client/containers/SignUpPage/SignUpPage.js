/**
 *
 * SignUpPage
 *
 * This component contains the form that allows visitors to sign up for a Guessify account
 */
import React from 'react';
import { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Alert, AlertTitle } from '@material-ui/lab';
import {Link as RouterLink} from 'react-router-dom'; //aliased to avoid confusion with Mateeriel-UI Link component
import TemplatePage from '../TemplatePage';
import { useSnackbar } from 'material-ui-snackbar-provider'
const SignUpPage = props => {
  const snackBar = useSnackbar()
  const [signUpInfo, setSignUpInfo] = useState({username: "",email:"",password:"",confirmPass:"",agreeTOS:false})
  const [success,setSuccess] = useState(false)
  const handleInputChange = e => {
    const {name, value} = e.target

    setSignUpInfo({...signUpInfo, [name]: value})
}

const sendRequest = async (user) => {
  const rep = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  });
  if(rep.success == false)
  rep.json().then(data =>snackBar.showMessage(`Something went terribly wrong :/ \n ${data.msg}`) )
  setSuccess(true)
}

const onSignUpButtonClick = (event) => {
  event.preventDefault();
  if(!signUpInfo.agreeTOS || signUpInfo.password != signUpInfo.confirmPass || signUpInfo.password == ""|| signUpInfo.username == ""|| signUpInfo.confirmPass == ""|| signUpInfo.email == ""|| !/\S+@\S+\.\S+/.test(signUpInfo.email)) {
    snackBar.showMessage("Please fill in all the fields/Some Fields are invalid")
    return;
  }
  sendRequest(signUpInfo);
}

  return(
  <TemplatePage>
    <Typography component="h1" variant="h5" align="center" color="primary" style={{marginBottom:15}}>
       Sign up
       </Typography>
       {
         success?(<Alert severity="success">
         <AlertTitle>Success</AlertTitle>
         You have successfully registered! <RouterLink to="/">Log in here</RouterLink>
       </Alert>):null
       }
       

       <form noValidate style={{marginTop:15}}>
       <Grid container spacing={2}>
           <Grid item xs={12}>
           <TextField
               value={signUpInfo.username}
               variant="outlined"
               required
               fullWidth
               id="userName"
               label="UserName"
               name="username"
               autoComplete="lname"
               onChange={handleInputChange}
           />
           </Grid>
           <Grid item xs={12}>
           <TextField
               value={signUpInfo.email}
               variant="outlined"
               required
               fullWidth
               id="email"
               label="Email"
               name="email"
               autoComplete="email"
               onChange={handleInputChange}
           />
           </Grid>
           <Grid item xs={12}>
           <TextField
               value={signUpInfo.password}
               variant="outlined"
               required
               fullWidth
               name="password"
               label="Password"
               type="password"
               id="password"
               autoComplete="current-password"
               onChange={handleInputChange}
           />
           </Grid>
           <Grid item xs={12}>
           <TextField
               value={signUpInfo.confirmPass}
               variant="outlined"
               required
               fullWidth
               name="confirmPass"
               label="Confirm Password"
               type="password"
               id="confirm-password"
               autoComplete="current-password"
               onChange={handleInputChange}
           />
           </Grid>
           <Grid item xs={12}>
           <FormControlLabel
               control={<Checkbox name="agreeTOS" checked={signUpInfo.agreeTOS} color="primary" />}
               label={
                   <React.Fragment>
                     I agree with <RouterLink to="#">Terms and Conditions</RouterLink>
                   </React.Fragment>
               }
               onChange={(e)=>  setSignUpInfo({...signUpInfo, agreeTOS: !signUpInfo.agreeTOS})}
           />
           </Grid>
       </Grid>
       <Button
           type="submit"
           fullWidth
           variant="contained"
           color="primary"
           onClick={onSignUpButtonClick}
           >
           Sign Up
       </Button>
       <Grid container justify="flex-end" style={{marginTop:20}}>
         <Grid item>
           You already have an account? <RouterLink to="/">Log in</RouterLink>
         </Grid>
       </Grid>
       </form>
  </TemplatePage>
)
}

export default SignUpPage;