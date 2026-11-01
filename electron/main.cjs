const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

let mainWindow = null;

// Ensure server is running or start it
function checkServer(port = 3001) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/roadmaps`, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 304);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(400, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureServer() {
  const isRunning = await checkServer(3001);
  if (isRunning) {
    console.log('[Roadify] Core server already running on port 3001');
    return true;
  }

  // Set persistent writable user data path
  try {
    const userDataPath = app.getPath('userData');
    process.env.ROADIFY_DATA_DIR = path.join(userDataPath, 'data');
    process.env.ROADIFY_DIST_DIR = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(process.env.ROADIFY_DATA_DIR)) {
      fs.mkdirSync(process.env.ROADIFY_DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.error('[Roadify] Error setting user data dir:', e);
  }

  // Start the bundled server
  const serverPath = path.join(__dirname, '..', 'dist-server', 'server.cjs');
  if (fs.existsSync(serverPath)) {
    try {
      require(serverPath);
      console.log('[Roadify] Started embedded core server from:', serverPath);
    } catch (err) {
      console.error('[Roadify] Error requiring server bundle:', err);
    }
  } else {
    console.warn('[Roadify] dist-server/server.cjs not found at:', serverPath);
  }

  // Poll until server responds (up to 3 seconds)
  for (let i = 0; i < 30; i++) {
    const ok = await checkServer(3001);
    if (ok) {
      console.log(`[Roadify] Server is ready on port 3001 after ${(i + 1) * 100}ms`);
      return true;
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  console.warn('[Roadify] Server did not respond within timeout, will fallback to file://');
  return false;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    title: 'Roadify — Визуальные дорожные карты и планирование спринтов',
    backgroundColor: '#0c0e17',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allow local file loading and cross-origin if fallback used
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // In production, try loading from local server first, fallback to dist/index.html
    mainWindow.loadURL('http://localhost:3001').catch((err) => {
      console.log('[Roadify] loadURL failed, loading local file:', err);
      mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.webContents.on('did-fail-load', (e, code, desc) => {
    console.warn('[Roadify] Failed to load URL, falling back to local file. Code:', code, desc);
    const localIndex = path.join(__dirname, '..', 'dist', 'index.html');
    if (fs.existsSync(localIndex)) {
      mainWindow.loadFile(localIndex);
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Application Menu
  const template = [
    {
      label: 'Файл',
      submenu: [
        {
          label: 'Импортировать .json...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const { filePaths } = await dialog.showOpenDialog(mainWindow, {
              title: 'Выберите файл дорожной карты Roadify',
              filters: [{ name: 'Roadify JSON', extensions: ['json'] }],
              properties: ['openFile'],
            });
            if (filePaths && filePaths[0]) {
              mainWindow.webContents.send('open-json-file', filePaths[0]);
            }
          },
        },
        { type: 'separator' },
        { label: 'Выход', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: 'Вид',
      submenu: [
        { label: 'Перезагрузить', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.reload() },
        {
          label: 'Полноэкранный режим',
          accelerator: 'F11',
          click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()),
        },
        { type: 'separator' },
        { label: 'Увеличить', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Уменьшить', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { label: 'Исходный масштаб', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Инструменты разработчика', accelerator: 'F12', click: () => mainWindow.webContents.toggleDevTools() },
      ],
    },
    {
      label: 'Справка',
      submenu: [
        {
          label: 'О проекте Roadify...',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'О Roadify',
              message: 'Roadify Desktop v1.1.1',
              detail: 'Платформа визуальных дорожных карт на бесконечном холсте с встроенным сервером MCP для ИИ-ассистентов.\n\nАвтор: OrdSword',
            });
          },
        },
        {
          label: 'Репозиторий на GitHub',
          click: () => shell.openExternal('https://github.com/ordsword/roadify'),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(async () => {
  await ensureServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
