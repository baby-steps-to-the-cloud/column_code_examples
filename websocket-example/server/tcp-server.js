const net = require('net')

const port = 6689

const tcpServer = net.createServer()

const tcpClients = {}

tcpServer.on('connection', (socket) => {
  console.log('a client conneceted:', socket.remoteAddress, socket.remotePort)
  let clientId = `${socket.remoteAddress}_${socket.remotePort}`
  tcpClients[clientId] = { '状态': '无聊', '兴奋度': 0 }  // 状态：'起兴', '热情'

  console.log(tcpClients)

  socket.on('data', (data) => {
    data = data.toString()
    try {
      message = JSON.parse(data)
      handle(socket, message, tcpClients[clientId])
    } catch (e) {
      console.error(e)
    }
  })

  socket.on('close', () => {
    console.log('client disconnected')
    delete tcpClients[clientId]
  })

})

tcpServer.listen(port, () => {
  console.log('server listening on', tcpServer.address().port)
})

function handle(socket, message, state) {
  console.log(message.content)
  let shouldClose = false
  let content = ''
  let detail = null
  switch (state['状态']) {
    case '无聊':
      switch (message.content) {
        case '我来了': content = '才来啊'; break
        case '路上堵': state['状态'] = '起兴'; content = '喝点啥'; detail = Beverage; break
        default: content = '呵呵'; shouldClose = true; break
      }; break
    case '起兴':
      switch (message.content) {
        case '我看看': content = '一般般'; break
        case '再来不': content = '不错哦'; state['兴奋度'] = state['兴奋度'] + 1; break
        case '听我的':
          if (state['兴奋度'] >= 2) { state['状态'] = '热情'; content = '随你哦'; detail = '<已解锁>' }
          else { content = '呵呵'; shouldClose = true }
          break
        default: content = '呵呵'; shouldClose = true; break
      }
      break
    case '热情':
      try {
        content = eval(message.content)
      } catch (e) {
        content = '呵呵'; shouldClose = true
      }
      break
    default: content = '呵呵'; shouldClose = true; break
  }
  socket.write(JSON.stringify({ 'content': content, 'detail': detail },'\r\r\n\n'))
  if (shouldClose) socket.destroy()
}

const Beverage = [
  'Cosmopolitan', 'Daiquiri', 'Negroni', 'Mojito', 'Old fashion', 'Screwdriver', 'Tequila Sunrise', 'Whiskey Sour'
]

