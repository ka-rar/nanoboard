const version = '1.0.0';

const appThemes = [
  { name: 'dark', hex: '#060E0F' },
  { name: 'light', hex: '#f0f0f0' },
  { name: 'beach', hex: '#FF7F50' },
];

const appAccents = [
  { name: 'leaf', hex: '#32CD32' },
  { name: 'lime', hex: '#A3D617' },
  { name: 'magenta', hex: '#E4007D' },
  { name: 'pink', hex: '#FF69B4' },
  { name: 'red', hex: '#FF4500' },
  { name: 'orange', hex: '#FF7F50' },
  { name: 'red', hex: '#FF1E1E' },
  { name: 'gamboge', hex: '#E49B0F' },
  { name: 'yellow', hex: '#FFD700' },
  { name: 'purple', hex: '#8C3FD4' },
  { name: 'azure', hex: '#0059ff' },
  { name: 'cyan', hex: '#14C3E2' },
  { name: 'teal', hex: '#14B7A6' },
];

let isConnected = false;
let selectedTheme = null;
let selectedAccent = null;
let isGeneratingToken = false;

onStart();
checkForUpdate();
setInterval(fetchStatus, 1200);

function onStart() {
  localStorage.setItem('version', version);
  document.getElementById('version').innerHTML = localStorage.getItem('version');

  document.getElementById('hostInput').value = localStorage.getItem('host');
  document.getElementById('authInput').value = localStorage.getItem('auth');

  document.getElementById('hostInput').focus();

  if (!localStorage.getItem('fetch-status')) {
    localStorage.setItem('fetch-status', 'true');
  }

  if (!localStorage.getItem('auto-connect')) {
    localStorage.setItem('auto-connect', 'true');
  }

  if (!localStorage.getItem('save-connect-data')) {
    localStorage.setItem('save-connect-data', 'true');
  }

  if (!localStorage.getItem('theme')) {
    localStorage.setItem('theme', appThemes[0].name);
  }

  if (!localStorage.getItem('accent')) {
    localStorage.setItem('accent', appAccents[0].hex);
  }

  if (localStorage.getItem('auto-connect') === 'true') {
    if (
      isValidIpAddress(document.getElementById('hostInput').value)
            && isValidAuthToken(document.getElementById('authInput').value)
    ) connectRequest();
  }

  updateTheme();
  updateAccent();
  updateSettings();

  document.getElementById('preference-theme').innerHTML = '';
  appThemes.forEach((color) => {
    const { name, hex } = color;

    const container = createButton(`${name}Mode`, hex, name);
    document.getElementById('preference-theme').appendChild(container.container);

    const storedName = localStorage.getItem('theme');
    if (storedName === name) {
      selectedTheme = container.button;
      container.button.innerHTML = checkmarkSvg;
    }

    container.button.addEventListener('click', () => {
      if (selectedTheme) selectedTheme.innerHTML = '';

      localStorage.setItem('theme', name);
      sendHeader(`Switched theme to ${name}!`, true);
      container.button.innerHTML = checkmarkSvg;

      selectedTheme = container.button;
      updateTheme();
    });
  });

  document.getElementById('preference-colors').innerHTML = '';
  appAccents.forEach((color) => {
    const { name, hex } = color;

    const container = createButton(`accent-${name}`, hex, name);
    document.getElementById('preference-colors').appendChild(container.container);

    const storedHex = localStorage.getItem('accent');
    if (storedHex === hex) {
      selectedAccent = container.button;
      container.button.innerHTML = checkmarkSvg;
    }

    container.button.addEventListener('click', () => {
      if (selectedAccent) selectedAccent.innerHTML = '';

      localStorage.setItem('accent', hex);
      sendHeader(`Switched accent to ${name}!`, true);
      container.button.innerHTML = checkmarkSvg;

      selectedAccent = container.button;
      updateAccent();
    });
  });
}

function checkForUpdate() {
  axios({
    method: 'post',
    url: 'http://localhost:50212/update',
    timeout: 5000,
    data: {
      version: localStorage.getItem('version'),
    },
  })
    .then(async (r) => {
      if (r.data.status === 426) {
        document.getElementById('update-footer').classList.add('red-bg');
        document.getElementById('update-footer').innerHTML = `<a target="_blank" href="https://github.com/ka-rar/nanoboard/releases" class="inter update-text button-hover">Update to <span class="accent-text">v${
          r.data.version
        }</span>!</a>`;
        sendUpdate('<b>App update available!</b>');
      }
    })
    .catch(() => {
      sendNotificationRaw('Could not check for updates!', false);
    });
}

function createCustomColors(userInput) {
  if (colorsActive !== lightColors) return;
  const storedColors = JSON.parse(localStorage.getItem('customColors')) || [];

  let updatedColors;
  if (userInput) {
    updatedColors = [userInput, ...storedColors.slice(0, 16)];
  } else {
    updatedColors = [...storedColors.slice(0, 17)];
  }

  if (updatedColors.length > 0 && colorsActive === lightColors) {
    document.getElementById('xColorsButton').style.display = 'block';
  } else {
    document.getElementById('xColorsButton').style.display = 'none';
  }

  localStorage.setItem('customColors', JSON.stringify(updatedColors));

  for (const color of updatedColors) {
    const container = createButton(color, addHash(color), addHash(color));

    panelColorsParent.appendChild(container.container);

    container.button.addEventListener('click', () => {
      if (selectedDeviceColor) selectedDeviceColor.innerHTML = '';

      selectedDeviceColor = container.button;

      const hsl = hexToHSL(color);

      const hueRequest = axios({
        method: 'put',
        url: 'http://localhost:50212/hue',
        timeout: 2000,
        data: {
          host: localStorage.getItem('host'),
          auth: localStorage.getItem('auth'),
          hue: Number(Math.round(hsl.hue)),
        },
      });

      const satRequest = axios({
        method: 'put',
        url: 'http://localhost:50212/sat',
        timeout: 2000,
        data: {
          host: localStorage.getItem('host'),
          auth: localStorage.getItem('auth'),
          sat: Number(Math.round(hsl.saturation)),
        },
      });

      Promise.all([hueRequest, satRequest])
        .then(() => {
          sendHeader(`Set color to ${addHash(color)}!`, true);
          fetchStatus();
        })
        .catch(() => {
          sendHeader('Failed to set color!', false);
          fetchStatus();
        });
    });
  }

  const dropperButton = document.createElement('button');
  dropperButton.id = 'dropper-color';
  dropperButton.className = 'button-hover small-button eye-dropper';
  dropperButton.style.backgroundColor = '#9a9a9a';
  dropperButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="button-svg svg-icon" height="1em" viewBox="0 0 512 512"><path d="M341.6 29.2L240.1 130.8l-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4L482.8 170.4c39-39 39-102.2 0-141.1s-102.2-39-141.1 0zM55.4 323.3c-15 15-23.4 35.4-23.4 56.6v42.4L5.4 462.2c-8.5 12.7-6.8 29.6 4 40.4s27.7 12.5 40.4 4L89.7 480h42.4c21.2 0 41.6-8.4 56.6-23.4L309.4 335.9l-45.3-45.3L143.4 411.3c-3 3-7.1 4.7-11.3 4.7H96V379.9c0-4.2 1.7-8.3 4.7-11.3L221.4 247.9l-45.3-45.3L55.4 323.3z"/></svg>';
  panelColorsParent.appendChild(dropperButton);

  dropperButton.addEventListener('click', () => {
    const inputField = createInputField('dropper-color', '#FF0000', 7, true);

    inputField.addEventListener('change', (event) => {
      const userInput = event.target.value;

      inputField.remove();

      if (!validateHex(userInput)) {
        sendHeader('Invalid hexadecimal format!', false);
        return;
      }

      const hsl = hexToHSL(userInput);

      const hueRequest = axios({
        method: 'put',
        url: 'http://localhost:50212/hue',
        timeout: 2000,
        data: {
          host: localStorage.getItem('host'),
          auth: localStorage.getItem('auth'),
          hue: Number(Math.round(hsl.hue)),
        },
      });

      const satRequest = axios({
        method: 'put',
        url: 'http://localhost:50212/sat',
        timeout: 2000,
        data: {
          host: localStorage.getItem('host'),
          auth: localStorage.getItem('auth'),
          sat: Number(Math.round(hsl.saturation)),
        },
      });

      Promise.all([hueRequest, satRequest])
        .then(() => {
          fetchStatus();
          createColors(lightColors, userInput);
          sendHeader(
            `Set color to ${addHash(userInput)}!`,
            true,
          );
        })
        .catch(() => {
          sendHeader('Failed to set color!', false);
          fetchStatus();
        });
    });
  });
}

document.getElementById('slider').addEventListener('change', (event) => {
  deviceBrightness = event.target.value;
  updateSliderValue();
  axios({
    method: 'put',
    url: 'http://localhost:50212/brightness',
    timeout: 2000,
    data: {
      host: localStorage.getItem('host'),
      auth: localStorage.getItem('auth'),
      light: Number(deviceBrightness),
    },
  }).then(() => {
    fetchStatus();
  });
});

function updateSliderValue() {
  const sliderValue = document.getElementById('sliderValue');
  if (deviceBrightness >= 100) {
    sliderValue.innerHTML = 'Max!';
  } else if (deviceBrightness <= 0) {
    sliderValue.innerHTML = 'Off';
  } else {
    sliderValue.innerHTML = `${deviceBrightness}%`;
  }
  document.getElementById('slider').value = deviceBrightness;
}

function updateTheme() {
  const root = document.documentElement;

  if (localStorage.getItem('theme') === 'light') {
    root.style.setProperty('--red', '#f32828');
    root.style.setProperty('--background', '#ffffff');
    root.style.setProperty('--input', 'rgba(185,185,185,1)');
    root.style.setProperty('--sidebarHover', '#eeeeee');
    root.style.setProperty('--sidebarActive', '#c7c7c7');
    root.style.setProperty('--primaryText', '#070606');
    root.style.setProperty('--secondaryText', '#525256');
    root.style.setProperty('--link', '#e8e6e6');
    root.style.setProperty('--accent', '#e4e4f0');
    root.style.setProperty('--accent2', '#d2d2da');
    root.style.setProperty('--accent3', '#030303');
    root.style.setProperty('--accent4', '#e2e4e8');
    root.style.setProperty('--accent5', '#090909');
    return;
  }

  if (localStorage.getItem('theme') === 'beach') {
    root.style.setProperty('--red', '#c41313');
    root.style.setProperty('--background', '#FF7F50');
    root.style.setProperty('--input', '#f87b4d');
    root.style.setProperty('--sidebarHover', '#ff8658');
    root.style.setProperty('--sidebarActive', '#f57c52');
    root.style.setProperty('--primaryText', '#090909');
    root.style.setProperty('--secondaryText', '#242629');
    root.style.setProperty('--link', '#e8e6e6');
    root.style.setProperty('--accent', '#ff1a4b');
    root.style.setProperty('--accent2', '#9d4cfa');
    root.style.setProperty('--accent3', '#030303');
    root.style.setProperty('--accent4', '#f16f46');
    root.style.setProperty('--accent5', '#0e0e0e');
    return;
  }

  root.style.setProperty('--red', '#d52b2b');
  root.style.setProperty('--background', '#090909');
  root.style.setProperty('--input', '#131313');
  root.style.setProperty('--sidebarHover', '#1c1c1c');
  root.style.setProperty('--sidebarActive', '#161616');
  root.style.setProperty('--primaryText', '#eaf5ea');
  root.style.setProperty('--secondaryText', '#999');
  root.style.setProperty('--link', '#e8e6e6');
  root.style.setProperty('--accent', '#ff1a4b');
  root.style.setProperty('--accent2', '#9d4cfa');
  root.style.setProperty('--accent3', '#030303');
  root.style.setProperty('--accent4', '#0d0d0d');
  root.style.setProperty('--accent5', '#0e0e0e');
}

function updateSettings() {
  const themed = document.getElementsByClassName('setting-button');
  for (let i = 0; i < themed.length; i++) {
    if (localStorage.getItem(themed[i].id) === 'true') {
      themed[i].style.backgroundColor = '#2b9e30';
    } else {
      themed[i].style.backgroundColor = '#c9352c';
    }
  }
}

function updateAccent() {
  const themed = document.getElementsByClassName('accent');
  for (let i = 0; i < themed.length; i++) {
    if (localStorage.getItem('accent')) {
      if (themed[i].id === 'github') {
        themed[i].style.fill = localStorage.getItem('accent');
        continue;
      }
      themed[i].style.backgroundColor = localStorage.getItem('accent');
      document.documentElement.style.setProperty(
        '--color',
        localStorage.getItem('accent'),
      );
      continue;
    }
    if (themed[i].id === 'github') {
      themed[i].style.fill = appAccents[0].hex;
    } else {
      themed[i].style.backgroundColor = appAccents[0].hex;
    }
  }

  const themedText = document.getElementsByClassName('accent-text');
  for (let i = 0; i < themedText.length; i++) {
    if (localStorage.getItem('accent')) {
      themedText[i].style.color = localStorage.getItem('accent');
      continue;
    }
    themedText[i].style.color = appAccents[0].hex;
  }
}

async function fetchStatus() {
  return new Promise((resolve, reject) => {
    if (!isConnected) {
      reject('Not connected');
      return;
    }

    axios({
      method: 'put',
      url: 'http://localhost:50212/connect',
      timeout: 2000,
      data: {
        host: localStorage.getItem('host'),
        auth: localStorage.getItem('auth'),
      },
    }).then((r) => {
      if (deviceOn !== r.data.state.on.value) {
        if (r.data.state.on.value) {
          sendHeader('Powered on!', true);
        } else {
          sendHeader('Powered off!', false);
        }
      }
      deviceOn = r.data.state.on.value;
      if (
        !document
          .getElementById('visibility-connected')
          .innerHTML.includes('Dashboard')
      ) document.getElementById('visibility-connected').style.color = deviceOn ? '#2b9e30' : '#c9352c';
      if (deviceOn) {
        document.getElementById(
          'toggleStateButton',
        ).style.backgroundColor = '#2b9e30';
        document.getElementById('device-header').style.color = '#2b9e30';
      } else {
        document.getElementById(
          'toggleStateButton',
        ).style.backgroundColor = '#c9352c';
        document.getElementById('device-header').style.color = '#c9352c';
      }
      if (deviceBrightness !== r.data.state.brightness.value) {
        deviceBrightness = r.data.state.brightness.value;
        updateSliderValue();
      }

      deviceColor = hslToHex(r.data.state.hue.value, r.data.state.sat.value);

      createColors(colorsActive);

      const container = document.getElementById('nanoleaf-container');

      container.innerHTML = '';

      const panelElement = document.createElement('button');
      panelElement.classList.add('panel');

      if (r.data.effects.select !== '*Solid*') {
        const effect = panelEffects.find(
          (effect) => effect.name === r.data.effects.select,
        );
        if (effect) {
          panelElement.innerHTML = effect.emoji;
          panelElement.style.backgroundColor = effect.backgroundColor;
        } else {
          panelElement.innerHTML = '❓'; // unknown (custom-made) effect
        }
      }
      container.appendChild(panelElement);

      const panels = document.getElementsByClassName('panel');
      for (let i = 0; i < panels.length; i++) {
        panels[i].style.filter = `brightness(${deviceBrightness + 10}%)`;
        if (deviceOn) {
          if (r.data.effects.select === '*Solid*') {
            panels[i].style.backgroundColor = deviceColor;
          }
        } else {
          panels[i].style.backgroundColor = '';
          panels[i].style.filter = 'brightness(0%)';
        }
      }
    });

    resolve('Fetched status');
  });
}

function toggleState() {
  axios({
    method: 'put',
    url: 'http://localhost:50212/toggleState',
    timeout: 2000,
    data: {
      host: document.getElementById('hostInput').value,
      auth: document.getElementById('authInput').value,
      on: deviceOn,
    },
  })
    .then(async () => {
      await fetchStatus();
    })
    .catch((r) => {
      console.log(r);
    });
}

function generateToken() {
  if (isGeneratingToken) return;
  isGeneratingToken = true;
  sendNotificationRaw('Generating...', true);
  axios({
    method: 'put',
    url: 'http://localhost:50212/createToken',
    timeout: 2000,
    data: {
      host: document.getElementById('hostInput').value,
    },
  })
    .then((r) => {
      isGeneratingToken = false;
      if (
        r.data.status === 401
                || r.data.status === 403
                || r.data.auth_token === undefined
      ) {
        if (r.data.status !== null) {
          sendHeader(
            `Failed to generate token. (Code ${r.data.status})`,
            false,
          );
        } else {
          sendHeader('Failed to generate token.', false);
        }
        document.getElementById('errorInfo').innerHTML = 'Failed to generate token, try again.';
      } else if (r.status === 200) {
        document.getElementById('authInput').value = r.data.auth_token;
        localStorage.setItem('auth', r.data.auth_token);
        sendHeader('Generated token!', true);
        document.getElementById('statusInfo').innerHTML = 'Generated an authorization token.';
        document.getElementById('errorInfo').innerHTML = '';
      }
    })
    .catch((r) => {
      isGeneratingToken = false;
      console.log(r);
      sendHeader('Failed to generate token.', false);
      document.getElementById('errorInfo').innerHTML = 'Failed to generate token, try again.';
    });
}

function connectRequest() {
  const ipAddress = document.getElementById('hostInput').value;
  const authToken = document.getElementById('authInput').value;

  if (!isValidIpAddress(ipAddress)) {
    if (ipAddress.length === 0) {
      document.getElementById('errorInfo').innerHTML = 'Missing IP address.';
    } else {
      document.getElementById('errorInfo').innerHTML = 'IP address is not properly formatted.';
    }
    return;
  }

  if (!isValidAuthToken(authToken)) {
    if (authToken.length === 0) {
      document.getElementById('errorInfo').innerHTML = 'Missing authorization token.';
    } else {
      document.getElementById('errorInfo').innerHTML = 'Authorization token is not properly formatted.';
    }
    return;
  }

  document.getElementById('errorInfo').innerHTML = '';
  document.getElementById('hostInput').disabled = true;
  document.getElementById('authInput').disabled = true;
  document.getElementById('connectButton').disabled = true;

  sendNotificationRaw('Connecting...', true);
  axios({
    method: 'put',
    url: 'http://localhost:50212/connect',
    timeout: 2000,
    data: {
      host: document.getElementById('hostInput').value,
      auth: document.getElementById('authInput').value,
    },
  })
    .then(async (r) => {
      isConnected = true;
      await fetchStatus().then(() => {
        deviceOn = r.data.state.on.value;

        if (deviceOn) {
          document.getElementById(
            'toggleStateButton',
          ).style.backgroundColor = '#2b9e30';
          document.getElementById('device-header').style.color = '#2b9e30';
        } else {
          document.getElementById(
            'toggleStateButton',
          ).style.backgroundColor = '#c9352c';
          document.getElementById('device-header').style.color = '#c9352c';
        }
        if (localStorage.getItem('device-name')) {
          document.getElementById('device-header').innerHTML = localStorage.getItem('device-name');
          document.getElementById('visibility-connected').innerHTML = localStorage.getItem('device-name');
        } else {
          document.getElementById('device-header').innerHTML = r.data.name;
          document.getElementById('visibility-connected').innerHTML = r.data.name;
        }
        document
          .getElementById('dashboard-ico')
          .setAttribute('viewBox', '0 0 512 512');
        document.getElementById('dashboard-ico').innerHTML = '<path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.2 5.4c-25.9 5.9-50 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z"/>';
        document.getElementById('errorInfo').innerHTML = '';
        document.getElementById('device-info').innerHTML = `${r.data.model} v${r.data.firmwareVersion} • `;
        if (localStorage.getItem('save-connect-data') === 'true') {
          localStorage.setItem(
            'host',
            document.getElementById('hostInput').value,
          );
          localStorage.setItem(
            'auth',
            document.getElementById('authInput').value,
          );
        }
        document.getElementById('hostInput').disabled = false;
        document.getElementById('authInput').disabled = false;
        document.getElementById('connectButton').disabled = false;
        fetchStatus();
        sendNotificationRaw('Connected!');
        toggleContent('dashboard-btn', 'content0');
      });
    })
    .catch((r) => {
      console.log(r);
      document.getElementById('statusInfo').innerHTML = '';
      document.getElementById('errorInfo').innerHTML = 'Unable to connect. Verify that the Nanoleaf device is connected to the network.';
      sendHeader('Unable to connect! Try again.', false);
      document.getElementById('hostInput').disabled = false;
      document.getElementById('authInput').disabled = false;
      document.getElementById('connectButton').disabled = false;
    });
}

function toggleContent(sidebarId, contentId) {
  const contents = document.getElementsByClassName('content');
  for (let i = 0; i < contents.length; i++) {
    contents[i].style.display = 'none';
  }

  const sidebars = document.getElementsByClassName('sidebar-btn');
  for (let i = 0; i < sidebars.length; i++) {
    sidebars[i].classList.remove('sidebar-btn-active');
  }

  const content = document.getElementById(contentId);
  if (content) {
    content.style.display = 'block';
  }

  const sidebar = document.getElementById(sidebarId);
  if (sidebar) {
    sidebar.classList.add('sidebar-btn-active');
  }
}
