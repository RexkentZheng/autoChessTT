import _ from 'lodash';

/**
 * @description: 获取index在坐标系中X和Y值
 * 此处需要根据奇数偶数来进行不同的判断，首先根据判断出y的内容
 * 如果index除以7没有余数，则y为index除以7的结果，否则需在结果上+1
 * 如果index除以7没有余数，则x为7
 * 否则x为index减去(y-1)*7，因为上面的y有进行+1操作
 * @param {number} index 元素的Index
 * @return {Object} { x, y } 元素的X和Y轴坐标
 */
const getLocation = (index) => {
  // Y值，有余数则加1，没有则取结果
  const y = index % 7 === 0 ? parseInt(index / 7) : parseInt(index / 7) + 1;
  // X值
  const x = index % 7 === 0 ? 7 : index - 7 * (y - 1);
  return { x, y };
}

/**
 * @description: 根据坐标获取元素离坐标系中具体的距离，设六边形一边的长度为2
 * 首先计算xL的值，判断y是否为偶数，如果为偶数，则xL为x*2*√3
 * 否则为需要在x*2后减去1再乘以√3
 * 上述的操作是以为其实并不是每个正六边形都是对其了Y轴的，奇数偶数的正六边形会有不同程度的位移
 * 接下来计算yL值，以为Y值并无偏移，所以可以的yL为3*y-1
 * @param {Object}} { x, y } 元素的X和Y轴坐标
 * @return {Object} { xL, yL } 元素的X和Y轴距离
 */
const getLength = ({x, y}) => {
  const xL = y % 2 === 0 ? x * 2 * Math.sqrt(3) : (x * 2 - 1) * Math.sqrt(3);
  const yL = y * 3 - 1;
  return { xL, yL };
}

/**
 * @description: 计算以目标六边形中心点位圆形，半径为六边形对角线长度的圆能覆盖多少六边形
 * 想象一张平面直角坐标系，X轴在上方，Y轴在左侧，获取到目标点和每个点的绝对距离，根据勾股定理
 * 得出两个六边形中心点的距离，判断此距离是否小于原的半径，得出小于则可以覆盖
 * PS：1. 同行的六边形暂时不要
 *     2. 六边形一边的长度暂定为2，圆半径的一个单位长度为2倍√3
 * @param {number} index 中心点
 * @param {number} unit 半径倍数
 * @return {Array} 在圆形范围内六边形的index
 */
export const culAttackWidth = (index, unit) => {
  const all = _.range(1, 29, 1);
  const res = []
  const { xL: indexXX, yL: indexYY } = getLength(getLocation(index));
  _.map(all, (item) => {
    const { xL: itemXX, yL: itemYY } = getLength(getLocation(item));
    //  同一行的先不要
    if (itemYY === indexYY) {
      return;
    }
    // 求绝对距离
    const absDistance = Math.sqrt((Math.pow(Math.abs(indexXX - itemXX), 2) + Math.pow(Math.abs(indexYY - itemYY), 2)));
    // 比较距离
    if (+absDistance.toFixed(5) <= +(2 * Math.sqrt(3) * unit).toFixed(5)) {
      res.push(item)
    }
  })
  return res;
}