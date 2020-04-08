import { drawCurvePath } from 'lib/utils';
import _ from 'lodash';
import { inject, observer }     from 'mobx-react';
import React from 'react';

@inject('battleStore')
@observer
export default class LineMain extends React.Component {

  constructor(props) {
    super(props);
    this.battleStore = this.props.battleStore.default;
    this.gycanvas = React.createRef();
    this.gycanvasWrapper = React.createRef();
    this.context = null;
  }

  state = {
    data: []
  };

  componentDidMount() {
    //初始化
    this.context = this.gycanvas.current.getContext('2d');
    this.originWidth = this.gycanvasWrapper.current.offsetWidth;
    this.originHeight = this.gycanvasWrapper.current.offsetHeight;
    this.gycanvas.current.width = this.originWidth;
    this.gycanvas.current.height = this.originHeight;
  }

  showMeLines(context, data) {
    let percent = 0;
    var colors = [];
		// 生成随机颜色
    for ( var i = 0; i < 10; i++ )  {
      colors.push(
        'rgb( ' +
          ( Math.random() * 255 >> 0 ) + ',' +
          ( Math.random() * 255 >> 0 ) + ',' +
          ( Math.random() * 255 >> 0 ) +
        ' )'
      );
    }
    context.stroke();
    const animate = () => {
      data.map((item, index) => {
        const [start, end] = item;
        context.beginPath();
        context.strokeStyle = colors[index];
        drawCurvePath(
          context,
          this.calPosition(start),
          this.calPosition(end),
          0.5,
          percent
        );
        context.stroke();
      })
      percent = (percent + 3) % 100;
      if (percent <= 96) {
        requestAnimationFrame(animate);
      } else {
        context.clearRect(0,0,this.originWidth, this.originHeight)
      }
    }
    animate();
  }

  // showSkills(context, skill) {
    
  //   let percent = 0;
  //   const start = 20;
  //   const end = 23;
  //   context.moveTo(this.calPosition(start)[0], this.calPosition(start)[1]);
  //   const animate = () => {
  //     context.lineTo(this.calPosition(end)[0] / 100 * percent, this.calPosition(end)[1] / 100 * percent);
  //     percent = (percent + 3) % 100;
  //     console.log(`${this.calPosition(end)[0] / 100 * percent}-${this.calPosition(end)[1] / 100 * percent}`)
  //     console.log(percent)
  //     if (percent <= 96) {
  //       requestAnimationFrame(animate);
  //     }
  //   }
  //   animate()
  // }

  calPosition(locationId) {
    const item = document.getElementById(`position-${locationId}`).getBoundingClientRect();
    const top = item.top + item.height / 2;
    const left = item.left + item.width / 2;
    return [
      left, top
    ]
  }

  static getDerivedStateFromProps(props) {
    return {
      data: props.data,
      skill: props.skill,
    }
  }

  render() {
    if (!_.isEmpty(this.gycanvas.current)) {
      this.gycanvas.current.getContext('2d').clearRect(0,0,this.originWidth, this.originHeight);
      this.showMeLines(this.gycanvas.current.getContext('2d'), this.state.data);
      // this.showSkills(this.gycanvas.current.getContext('2d'), this.state.skill);
    }
    return (
      <div className="gycanvas-wrapper" ref={this.gycanvasWrapper} >
        <canvas id="gycanvas" className="gycanvas" ref={this.gycanvas}></canvas>
      </div>
    );
  }

}
