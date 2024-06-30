import React from 'react';
import { CustomPicker } from 'react-color';
var {Circle} = require('react-color/lib/components/circle/Circle.js');
class BlackWhiteColorPicker extends React.Component {
  
  constructor(props){
    super(props);
    
  }


  render() {
    return (
    <div style={{height:"50px",width:"50px",position:"relative", background:"whitesmoke"}}>
      <Circle width="max-content" onChange={this.props.onValueChanged} circleSize={20} colors={['#FFFFFF','#000000']}/>
      

    </div>);
  }
}

export default CustomPicker(BlackWhiteColorPicker);