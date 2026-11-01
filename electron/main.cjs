const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow = null;
let serverProcess = null;

// Ensure server is running or start it
function ensureServer() {
  return new Promise((resolve) => {
    // Check if server is already responding on port 3001
    const req = http.get('http://localhost:3001/api/roadmaps', (res) => {
      resolve();
    });

    req.on('error', () => {
      // Start server in-process or via fork
      try {
        require('../server/index.ts');
        setTimeout(resolve, 1000);
      } catch (err) {
        console.log('Starting standalone server:', err.message);
        setTimeout(resolve, 1500);
      }
    });

    req.setTimeout(500, () => {
      req.destroy();
      resolve();
    });
  });
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
      webSecurity: true,
    },
  });

  // Load from local dist or dev server
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // In production, load from the local server or local file
    mainWindow.loadURL('http://localhost:3001').catch(() => {
      mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
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
              message: 'Roadify Desktop v1.1.0',
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
