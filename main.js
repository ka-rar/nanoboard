const {
  app, BrowserWindow, globalShortcut, shell,
} = require('electron');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const semver = require('semver');

const expressApp = express();

let win;

expressApp.use(bodyParser.json());

app.on('browser-window-focus', () => {
  globalShortcut.register('CommandOrControl+R', () => {});
  globalShortcut.register('F5', () => {});
});

app.on('browser-window-blur', () => {
  globalShortcut.unregister('CommandOrControl+R');
  globalShortcut.unregister('F5');
});

expressApp.get('/minimize', async (req, res) => {
  win.minimize();
  res.sendStatus(200);
});

expressApp.put('/createToken', async (req, res) => {
  try {
    const response = await axios({
      method: 'post',
      url: `http://${req.body.host}:16021/api/v1/new`,
      timeout: 2000,
    });
    res.send(response.data);
  } catch (error) {
    res.send(error);
  }
});

expressApp.put('/connect', async (req, res) => {
  try {
    const response = await axios({
      method: 'get',
      url:
                `http://${
                  req.body.host
                }:16021/api/v1/${
                  req.body.auth
                }/`,
      timeout: 2000,
    });
    res.send(response.data);
  } catch (error) {
    res.send(500);
  }
});

expressApp.put('/toggleState', async (req, res) => {
  try {
    await axios({
      method: 'put',
      url:
                `http://${
                  req.body.host
                }:16021/api/v1/${
                  req.body.auth
                }/state`,
      timeout: 2000,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        on: { value: req.body.on === false },
      },
    });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

expressApp.put('/brightness', async (req, res) => {
  try {
    await axios({
      method: 'put',
      url:
                `http://${
                  req.body.host
                }:16021/api/v1/${
                  req.body.auth
                }/state`,
      timeout: 2000,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        brightness: { value: req.body.light },
      },
    });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

expressApp.put('/hue', async (req, res) => {
  try {
    await axios({
      method: 'put',
      url:
                `http://${
                  req.body.host
                }:16021/api/v1/${
                  req.body.auth
                }/state`,
      timeout: 2000,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        hue: { value: req.body.hue },
      },
    });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

expressApp.put('/sat', async (req, res) => {
  try {
    await axios({
      method: 'put',
      url:
                `http://${
                  req.body.host
                }:16021/api/v1/${
                  req.body.auth
                }/state/sat`,
      timeout: 2000,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        sat: { value: req.body.sat },
      },
    });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

expressApp.put('/effect', async (req, res) => {
  try {
    await axios({
      method: 'put',
      url:
                `http://${
                  req.body.host
                }:16021/api/v1/${
                  req.body.auth
                }/effects`,
      timeout: 2000,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        select: req.body.effect,
      },
    });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

const getLatestReleases = async () => new Promise(async (resolve) => {
  const body = await fetch(
    'https://api.github.com/repos/ka-rar/nanoboard/releases/latest',
  );
  try {
    var data = await body.json();
  } catch {
    resolve({ outage: true });
  }

  resolve(data);
});

expressApp.post('/update', async (req, res) => {
  const latestRelease = await getLatestReleases();
  if (latestRelease.url) {
    if (req.body.version === undefined) {
      res.send({ status: 426, version: latestRelease.tag_name });
    } else if (semver.gt(latestRelease.tag_name, req.body.version)) {
      res.send({ status: 426, version: latestRelease.tag_name });
    } else {
      res.send({ status: 200, version: req.body.version });
    }
  }
});

const createWindow = () => {
  win = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1080,
    height: 600,
    minWidth: 1080,
    minHeight: 530,
    maxWidth: 1366,
    maxHeight: 600,
    webPreferences: {
      devTools: false,
    },
    icon: `${__dirname}/icon.png`,
    frame: false,
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.loadFile('index.html');
};

app.whenReady().then(() => {
  expressApp.listen(50212, () => {});

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
