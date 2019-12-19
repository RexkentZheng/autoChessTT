const getRateResult = (arr) => {
  if (arr.length === 1) {
    return 1
  }
  let leng = 0;
  let tmpArr = [];
  for(let i=0; i<arr.length; i++){
      leng+=arr[i];//获取总数
      tmpArr[i + 1] = arr[i]; //重新封装奖项，从1开始
  }
  tmpArr[0] = 0;
  for(let i=0; i<tmpArr.length; i++){
      if(i > 0) {
          tmpArr[i] += tmpArr[i - 1]; //计算每项中奖范围
      }
  }
  let random = parseInt(Math.random()*leng); //获取 0-总数 之间的一个随随机整数
  for(let i=1; i<tmpArr.length; i++){
      if(tmpArr[i - 1] <= random && random < tmpArr[i]) {
         return i; //返回中奖的项数（按概率的设置顺序）
      }
  }
}

export {
  getRateResult,
}
