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
    this.data = [
      [[100, 150], [200, 300]],
      [[200, 300], [288, 400]]
    ]
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

  calPosition(locationId) {
    const item = document.getElementById(`position-${locationId}`);
    const left = item.offsetLeft + (item.offsetWidth + 14) / 2;
    const top = (locationId > 28 ? item.offsetTop + 300 : item.offsetTop + 20) - item.offsetHeight / 5 * 3;
    // console.log(`${locationId} --- ${[left, top]}`)
    return [
      left, top
    ]
  }

  static getDerivedStateFromProps(props) {
    return {
      data: props.data
    }
  }

  render() {
    if (!_.isEmpty(this.gycanvas.current)) {
      this.gycanvas.current.getContext('2d').clearRect(0,0,this.originWidth, this.originHeight)
      this.showMeLines(this.gycanvas.current.getContext('2d'), this.state.data)
    }
    return (
      <div className="gycanvas-wrapper" ref={this.gycanvasWrapper} >
        <canvas className="gycanvas" ref={this.gycanvas}></canvas>
      </div>
    );
  }

}
