import React from 'react';
import { Link } from 'react-router-dom';
import Banner from './images/banner.png';
import './style.scss';

class Header extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div className="header">
          <img src={Banner} alt="react-redux-boilerplate - Logo" /> 
       
      </div>
    );
  }
}

export default Header;
