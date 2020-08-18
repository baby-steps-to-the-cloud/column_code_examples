const WebSocket = require('ws')

const wsServer = new WebSocket.Server({ port: 3000 })

// client session state
const wsClients = {}

wsServer.on('connection', (ws, req) => {
  let clientId = req.headers['sec-websocket-key']
  console.log(`client ${clientId} connected.`)
  wsClients[clientId] = { '状态': '无聊', '兴奋度': 0 }  // 状态：'起兴', '热情'

  ws.on('message', (message) => {
    message = JSON.parse(message)
    handle(ws, message, wsClients[clientId])
  })

  ws.on('close', (message) => {
    console.log(`client ${clientId} closed.`)
    delete wsClients[clientId]
  })

})

// handle message of the specific client and emit
function handle(ws, message, state) {
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
  ws.send(JSON.stringify({ 'content': content, 'detail': detail }))
  if (shouldClose) ws.close()
}

const Beverage = [
  'Cosmopolitan', 'Daiquiri', 'Negroni', 'Mojito', 'Old fashion', 'Screwdriver', 'Tequila Sunrise', 'Whiskey Sour'
]

