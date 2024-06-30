/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React from 'react';
import { Switch, Route, BrowserRouter} from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import HomePage from '../../containers/HomePage';
import SignUpPage from '../../containers/SignUpPage';
import GamePage from '../../containers/GamePage';
import NotFoundPage from '../../containers/NotFoundPage';
import './style.css';
import '../../styles/global-styles.css';
import { SnackbarProvider } from 'material-ui-snackbar-provider'

const App = () => (
  <SnackbarProvider SnackbarProps={{ autoHideDuration: 4000 }}>
 <div className="app-wrapper">
    
    <div className="app-content">
    <BrowserRouter>
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route path="/game" component={GamePage} />
      <Route path="/signup" component={SignUpPage} />
      <Route path="" component={NotFoundPage} />

    </Switch>
    </BrowserRouter>
    
    </div>
    
    </div>
  </SnackbarProvider>
);

export default App;
