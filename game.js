// 创建画布
const canvas = wx.createCanvas()
const { windowWidth, windowHeight } = wx.getSystemInfoSync()
// console.log(windowWidth, windowHeight);
// 方向:down,up,left,right
let direction = 'down'
// 上一次改变的方向
let prevDirection = 'down'
// 改变方向后是否执行
let isRunChange = true
// 蛇的宽度：50px
let snakeWidth = 25
// 长度:默认为2（不应该使用长度来记录）
// let snakeLength = 4
// 蛇数组，一节为一个对象（应该用数组）
let snake = [
  {
    x: 0, // x轴
    y: 0, // y轴
    itemDirection: 'down',  // 行进方向
  },
  {
    x: 0,
    y: snakeWidth,
    itemDirection: 'down'
  },
  {
    x: 0,
    y: snakeWidth * 2,
    itemDirection: 'down'
  }
]
// 改变节点的下标(changeInde应该放入数组中,下一步改这里-----------------)
// let changeIndex = 0
let changeIndexs = []
// 移动速度：500毫秒
let speed = 300
// 位置
// let snakeX = 0 //canvas.width / 2 - (snakeWidth / 2)
// let snakeY = 0 //0
// 定时器
let snakeTimer = null
// 活动区的高度
let regionHeight = 500
// 肉的 x 坐标
let meatX = ''
// 肉的 y 坐标
let meatY = ''
// 总得分
let points = 0
// 每得 10 分加一次速
let stage = 10
// 每次加速的速度
let accelerateSpeed = 25

// 绘制一个矩形
const context = canvas.getContext('2d')

// 计算活动区和控制台高度
initHeight()
function initHeight() {
  // 控制台初始高度
  let consoleHeight = 200
  // 剩余的高度
  let otherHeight = windowHeight - consoleHeight
  // 控制台初始高度加上剩余高度和蛇的尺寸的余数
  consoleHeight = consoleHeight + (otherHeight % snakeWidth)
  // 得出活动区的高度
  regionHeight = windowHeight - consoleHeight
}

// 初始化蛇
initSnake()
// 初始化操作区
pancel()
// 初始化
function initSnake() {
  // 蛇的颜色
  context.fillStyle = '#1aad19'
  // 清空元素
  context.clearRect(0, 0, windowWidth, regionHeight)
  // 绘制初始位置
  drawSnack()
  // 开始游走
  wx.showModal({
    title: '',
    content: '是否开始游戏？',
    success(res) {
      if(res.confirm) {
        wandering()
      }
    }
  })
}

// 绘制蛇
function drawSnack() {
  context.clearRect(0, 0, windowWidth, regionHeight)
  // 创建肉
  createMeat()

  // 因为 Android 需要进行每帧调用，所以每次绘制蛇时也需要重新绘制控制台
  pancel()

  // 已数组的形式绘制蛇
  for(let i = 0; i < snake.length; i++) {
    const { x, y } = snake[i]
    if(i === snake.length - 1) {
      context.fillStyle = '#0f0'
    } else {
      context.fillStyle = '#1aad19'
    }
    context.fillRect(x, y, snakeWidth, snakeWidth)
    // context.fillStyle = '#fff'
    // context.fillText(i, x, y)
  }

  // 绘制得分
  context.fillStyle = '#fff'
  context.font = 'normal 30px sans-serif'
  context.setTextAlign = 'center'
  context.fillText(points, windowWidth / 2, 50)

}
// 游走
function wandering() {
  snakeTimer = setInterval(() => {

    // 反转数组进行遍历，改变每一节的坐标
    snake.reverse()

    /***************** 模拟吃肉 *****************/
    let eatMeat = snake.filter(val => val.x === meatX && val.y === meatY)
    // 如果重叠的坐标数组大于0，则说明吃上肉了
    if(eatMeat.length > 0) {
      // console.log('吃上了');
      /***************** 加分 *****************/
      points ++ 

      /***************** 加速 *****************/
      if(points % stage === 0 && speed > 50) {
        clearInterval(snakeTimer)
        snakeTimer = null
        speed = speed - accelerateSpeed
        wandering()
      }

      /***************** 重新创建肉 *****************/
      createMeat(true)

      /***************** 吃肉后添加一节蛇 *****************/
      // 最后一节蛇
      let lastSnakeItem = snake[snake.length - 1]
      // 最后一节蛇的行进方向
      let lastSnakeItemDirection = lastSnakeItem.itemDirection
      // 新增的一节蛇的坐标
      let addSnakeX = lastSnakeItem.x
      let addSnakeY = lastSnakeItem.y
      // 向下
      if(lastSnakeItemDirection === 'down') {
        addSnakeY = addSnakeY - snakeWidth
      }
      // 向上
      if(lastSnakeItemDirection === 'up') {
        addSnakeY = addSnakeY + snakeWidth
      }
      // 向左
      if(lastSnakeItemDirection === 'left') {
        addSnakeX = addSnakeX + snakeWidth
      }
      // 向右
      if(lastSnakeItemDirection === 'right') {
        addSnakeX = addSnakeX - snakeWidth
      }
      snake.push({
        x: addSnakeX,
        y: addSnakeY,
        itemDirection: lastSnakeItemDirection
      })
      // console.log('吃肉');
      // console.log(snake);
    }

    /***************** 控制转向 *****************/
    // 将改变后的节点下标过滤掉
    changeIndexs = changeIndexs.filter(val => val < snake.length)
    // console.log(changeIndexs);
    // 除了蛇头,将上个节点的方向赋值给当前节点
    for (let i = 0; i < changeIndexs.length; i++) {
      const element = changeIndexs[i];
      // console.log(element);
      if(element > 0) {
        // 如果是急转弯，即改变节点下标相差1；则第二节蛇的转弯方向为第一节蛇的上一次行进方向
        if(changeIndexs[i + 1] != undefined && element - changeIndexs[i + 1]  == 1 && element == 1) {
          snake[element].itemDirection = prevDirection
          console.log('急转弯');
        } else {
          snake[element].itemDirection = snake[element - 1].itemDirection
        }
      }
    }
    
    /***************** 移动 *****************/
    for (let i = 0; i < snake.length; i++) {
      let { x, y, itemDirection } = snake[i];
      
      // 向下游走
      if(itemDirection === 'down') {
        snake[i].y = y + snakeWidth
      }
      // 向上游走
      if(itemDirection === 'up') {
        snake[i].y = y - snakeWidth
      }
      // 向右游走
      if(itemDirection === 'right') {
        snake[i].x = x + snakeWidth
      }
      // 向左游走
      if(itemDirection === 'left') {
        snake[i].x = x - snakeWidth
      }

    }

    // 递增节点下标
    for (let ci = 0; ci < changeIndexs.length; ci++) {
      let change = changeIndexs[ci];
      changeIndexs[ci] = change + 1
    }

    // 将数组反转回之前的顺序
    snake.reverse()

    /***************** 游戏结束情况 *****************/
    // 目前先不做穿墙，撞墙则死
    const snakeX = snake[snake.length - 1].x
    const snakeY = snake[snake.length - 1].y
    // 如果移动的Y轴坐标大于等于活动区的高度则表示撞了底部的墙
    if(snakeY + snakeWidth > regionHeight) {
      gameOver('你撞墙了，游戏结束！')
      return
    }
    // 如果移动的y轴坐标小于0则表示撞了顶部的的墙
    if(snakeY < 0 && direction === 'up') {
      gameOver('你撞墙了，游戏结束！')
      return
    }
    // 如果移动的X轴坐标大于等于屏幕宽度则表示撞了右边的的墙
    if(snakeX + snakeWidth > windowWidth) {
      gameOver('你撞墙了，游戏结束！')
      return
    }
    // 如果移动的X轴坐标小于0则表示撞了左边的的墙
    if(snakeX < 0 && direction === 'left') {
      gameOver('你撞墙了，游戏结束！')
      return
    }
    // 如果蛇头和任意一节蛇身重叠，则说明咬到了自己
    let biteSelf = snake.filter(val => val.x === snakeX && val.y === snakeY)
    if(biteSelf.length > 1) {
      gameOver('你咬到了自己，游戏结束！')
      return
    }

    // console.log(snake);

    // 标识改变方向后执行了
    isRunChange = true
    
    // 绘制
    drawSnack()

  }, speed)
}

// 绘制肉
function createMeat(reload) {
  // 肉的颜色
  context.fillStyle = '#fff'
  // 如果 x 和 y 坐标都为''，则说明被吃掉了，需要重新生成，或者 reload 为 true，也要重新生成
  if((meatX === '' && meatY === '') || reload) {
    meatX = ''
    meatY = ''
    // 随机生成肉的坐标
    // 如果得分为0，则给一个固定的位置
    if(!points) {
      meatX = 0
      meatY = 200
    } else {
      // x 轴最大倍数
      let xMaxIndex = (windowWidth / snakeWidth) - 1
      // y 轴最大倍数
      let yMaxIndex = (regionHeight / snakeWidth) - 1
      // 随机生成 x, y 轴，并且不能和蛇的坐标冲突
      let randomX, randomY = 0
      for (;;) {
        randomX = parseInt(xMaxIndex * Math.random())
        randomY= parseInt(yMaxIndex * Math.random())
        meatX = randomX * snakeWidth
        meatY = randomY * snakeWidth
        let overlap = snake.filter(val => val.x === meatX && val.y === meatY)
        // 如果重叠的数量等于0，则说明没有冲突，则不需要重新获取，执行 break 跳出死循环
        if(overlap.length === 0) {
          break
        }
        // console.log(overlap);
      }
    }
  }
  context.fillRect(meatX, meatY, snakeWidth, snakeWidth)
}

// 初始化操作区
function pancel() {
  // 绘制背景
  context.fillStyle = '#fff'
  context.clearRect(0, regionHeight, windowWidth, windowHeight - regionHeight)
  context.fillRect(0, regionHeight, windowWidth, windowHeight - regionHeight)
  // 绘制按钮
  context.fillStyle = '#1aad19'
  // 按钮宽度
  let btnWidth = 60
  // 上下按钮x轴坐标
  let axisX = windowWidth / 2 - (btnWidth / 2)
  // y轴坐标
  let axisY = regionHeight + 10
  // 上
  context.fillRect(axisX, axisY, btnWidth, btnWidth)
  // 下
  context.fillRect(axisX, axisY + btnWidth * 2, btnWidth, btnWidth)
  // 左
  context.fillRect(axisX - btnWidth, axisY + btnWidth, btnWidth, btnWidth)
  // 右
  context.fillRect(axisX + btnWidth, axisY + btnWidth, btnWidth, btnWidth)

  // 监听点击事件
  wx.onTouchStart((res) => {
    // 点击区域的x坐标
    let clickX = res.changedTouches[0].clientX
    // 点击区域的y坐标
    let clickY = res.changedTouches[0].clientY
    // 单击向上按钮
    if(clickX > axisX && clickX < axisX + btnWidth && clickY > axisY && clickY < axisY + btnWidth) {
      clickEvent('up');
    }
    // 单击向下按钮
    if(clickX > axisX && clickX < axisX + btnWidth && clickY > axisY + btnWidth * 2 && clickY < axisY + btnWidth * 2 + btnWidth) {
      clickEvent('down');
    }
    // 单击向左按钮
    if(clickX > axisX - btnWidth && clickX < axisX - btnWidth + btnWidth && clickY > axisY + btnWidth && clickY < axisY + btnWidth + btnWidth) {
      clickEvent('left');
    }
    // 单击向右按钮
    if(clickX > axisX + btnWidth && clickX < axisX + btnWidth + btnWidth && clickY > axisY + btnWidth && clickY < axisY + btnWidth + btnWidth) {
      clickEvent('right');
    }
  })
}

// 单击事件
function clickEvent(type) {
  // console.log(type);
  // 如果点击方向和行进方向相同或和行进方向相反，则不执行操作
  if(direction === type || !isRunChange) return
  if(type === 'left' && direction === 'right') return
  if(type === 'right' && direction === 'left') return
  if(type === 'up' && direction === 'down') return
  if(type === 'down' && direction === 'up') return
  // 记录上一次转弯的方向
  prevDirection = direction
  // 将蛇头的行进方向改为最新的行进方向
  snake[snake.length - 1].itemDirection = type
  direction = type
  // 每次改变方向需要初始化节点下标
  // changeIndex = 0
  changeIndexs.push(0)
  // console.log(snake);
  // 标识改变了方向还未执行
  isRunChange = false
}

// 游戏结束
function gameOver(title) {
  clearInterval(snakeTimer)
  snakeTimer = null
  wx.showModal({
    title: '提示',
    content: title + '是否重新开始',
    success(res) {
      if(res.confirm) {
        direction = 'down'
        prevDirection = 'down'
        isRunChange = true
        snakeWidth = 25
        snake = [
          {
            x: 0, // x轴
            y: 0, // y轴
            itemDirection: 'down',  // 行进方向
          },
          {
            x: 0,
            y: snakeWidth,
            itemDirection: 'down'
          },
          {
            x: 0,
            y: snakeWidth * 2,
            itemDirection: 'down'
          }
        ]
        changeIndexs = []
        speed = 200
        snakeTimer = null
        meatX = ''
        meatY = ''
        points = 0
        wandering()
      }
    }
  })
}
