const { app, BrowserWindow, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const http = require('http')

const API_PORT = 47321
let feedbackServer = null

function ensureDataDir() {
  const dataDir = path.join(app.getPath('userData'), 'data')
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  return dataDir
}

function appendJsonRecord(filename, record) {
  const dataDir = ensureDataDir()
  const filePath = path.join(dataDir, filename)
  let list = []
  if (fs.existsSync(filePath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      if (Array.isArray(parsed)) list = parsed
    } catch (_) {
      list = []
    }
  }
  list.push(record)
  fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8')
}

function startFeedbackServer() {
  if (feedbackServer) return

  feedbackServer = http.createServer((req, res) => {
    if (req.method !== 'POST' || req.url !== '/api/feedback') {
      res.writeHead(404, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      })
      res.end(JSON.stringify({ ok: false, error: 'not_found' }))
      return
    }

    let body = ''
    req.on('data', chunk => {
      body += chunk
      if (body.length > 1024 * 128) req.destroy()
    })

    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}')
        const email = String(payload.email || '').trim().toLowerCase()
        const comment = String(payload.comment || '').trim()
        const minutesInApp = Number(payload.minutesInApp || 0)

        if (!email || !comment) {
          res.writeHead(400, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          })
          res.end(JSON.stringify({ ok: false, error: 'missing_fields' }))
          return
        }

        appendJsonRecord('feedback.json', {
          email,
          comment,
          minutesInApp,
          source: String(payload.source || 'app-5min-feedback'),
          receivedAt: new Date().toISOString(),
        })

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        })
        res.end(JSON.stringify({ ok: true }))
      } catch (_) {
        res.writeHead(400, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        })
        res.end(JSON.stringify({ ok: false, error: 'invalid_json' }))
      }
    })
  })

  feedbackServer.listen(API_PORT, '127.0.0.1')
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 740,
    minWidth: 700,
    minHeight: 500,
    title: 'Escalas para Improvisación',
    backgroundColor: '#080808',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
  })
  win.loadFile('landing.html')
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  startFeedbackServer()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (feedbackServer) {
    try { feedbackServer.close() } catch (_) {}
    feedbackServer = null
  }
  if (process.platform !== 'darwin') app.quit()
})
