import banner from '../../images/banner.png';
import React from 'react';
import './style.css';
import Paper from '@material-ui/core/Paper';
const TemplatePage = (props) => {
    return (<main className="maindiv">
      <div>
        <img id="banner" title="This is our awesome banner ! Cool huh ?" src={banner} style={{ marginLeft: 125 }} />
      </div>
      <Paper className="paper">
        {props.children}
      </Paper>
          </main>)
}

export default TemplatePage;