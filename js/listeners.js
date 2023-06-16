document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const content = document.getElementById('content1');
    if (content.style.display !== 'none') {
      event.preventDefault();

      const button = document.getElementById('connectButton');
      if (button) button.click();
    }
  }
});

document.getElementById('authInput').addEventListener('blur', () => {
  const passwordInput = document.getElementById('authInput');
  passwordInput.type = 'password';
});

document.getElementById('authInput').addEventListener('click', () => {
  const passwordInput = document.getElementById('authInput');
  passwordInput.type = 'text';
  // Place caret at end of input
  setTimeout(() => {
    passwordInput.selectionStart = passwordInput.value.length;
    passwordInput.selectionEnd = passwordInput.value.length;
    passwordInput.focus();
  }, 1);
});

document.getElementById('clearData').addEventListener('click', () => {
  localStorage.clear();
  location.reload();
});

document.getElementById('x-btn').addEventListener('click', () => {
  window.close();
  proccess.exit();
});

document.getElementById('min-btn').addEventListener('click', () => {
  axios({
    method: 'get',
    url: 'http://localhost:50212/minimize',
    timeout: 2000,
  });
});

document
  .getElementById('connectButton')
  .addEventListener('click', connectRequest);
document.getElementById('dashboard-btn').addEventListener('click', () => {
  if (isConnected) {
    toggleContent('dashboard-btn', 'content0');
  } else {
    toggleContent('dashboard-btn', 'content1');
    document.getElementById('hostInput').focus();
  }
});

document
  .getElementById('switchPaletteButton')
  .addEventListener('click', () => {
    if (colorsActive === defaultColorPalette) {
      colorsActive = lightColors;
      localStorage.setItem('last-on-colors', 'light');
      document.getElementById('color-palette').innerHTML = 'Your Palette';
    } else {
      colorsActive = defaultColorPalette;
      localStorage.setItem('last-on-colors', 'dark');
      document.getElementById('color-palette').innerHTML = 'Color Palette';
    }
    createColors(colorsActive);
  });

document.getElementById('xColorsButton').addEventListener('click', () => {
  localStorage.removeItem('customColors');
  createColors(colorsActive);
  sendNotificationRaw('Cleared saved colors!', false);
});

document
  .getElementById('switchEffectsButton')
  .addEventListener('click', () => {
    document.getElementById('bg-colors').style.display = 'none';
    document.getElementById('panel-effects').style.display = 'block';
  });

document
  .getElementById('switchColorsButton')
  .addEventListener('click', () => {
    document.getElementById('bg-colors').style.display = 'block';
    document.getElementById('panel-effects').style.display = 'none';
  });

document.getElementById('settings-btn').addEventListener('click', () => {
  toggleContent('settings-btn', 'content2');
});

document.getElementById('settings-btn').addEventListener('click', () => {
  toggleContent('settings-btn', 'content2');
});

document.getElementById('generateToken').addEventListener('click', () => {
  if (isValidIpAddress(document.getElementById('hostInput').value)) {
    generateToken();
  } else {
    document.getElementById('errorInfo').innerHTML = 'IP Address is not properly formatted.';
  }
});

document
  .getElementById('changeNameButton')
  .addEventListener('click', () => {
    const inputField = createInputField('changeNameButton', 'Shapes', 10);

    // Capture the input from the user
    inputField.addEventListener('change', (event) => {
      const userInput = event.target.value;

      inputField.remove();

      if (userInput.trim().length === 0) {
        sendHeader('Name cannot be empty!', false);
        return;
      }

      localStorage.setItem('device-name', userInput);
      sendHeader(`Set name to ${userInput}!`, true);

      document.getElementById('device-header').innerHTML = localStorage.getItem('device-name');
      document.getElementById('visibility-connected').innerHTML = localStorage.getItem('device-name');
    });
  });

document
  .getElementById('toggleStateButton')
  .addEventListener('click', toggleState);
document
  .getElementById('disconnectButton')
  .addEventListener('click', () => {
    isConnected = false;
    deviceOn = false;
    deviceColor = '#FFFFFF';
    deviceBrightness = 50;
    toggleContent('dashboard-btn', 'content1');
    document.getElementById('dashboard-btn').innerHTML = '                <svg id="dashboard-ico" xmlns="http://www.w3.org/2000/svg" class="sidebar-svg settings-svg fill-white"\n'
            + '                     height="1.1em"\n'
            + '                     viewBox="0 0 448 512"><path d="M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288H175.5L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-30-20.7H272.5L349.4 44.6z"/></svg>\n'
            + '                &nbsp;\n'
            + '                <span class="nav-inter" id="visibility-connected">Dashboard</span>';
    sendNotificationRaw('Disconnected!', false);
    document.getElementById('statusInfo').innerHTML = '';
    document.getElementById('errorInfo').innerHTML = '';
    document.getElementById('hostInput').focus();
  });

document.getElementById('help-btn').addEventListener('click', () => {
  const content = document.getElementById('help-content');
  if (content) {
    if (content.style.display === 'block') {
      content.style.display = 'none';
      document.getElementById('help-ico').innerHTML = '<path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/>';
    } else {
      content.style.display = 'block';
      document.getElementById('help-ico').innerHTML = '<path d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"/>';
    }
  }
});

document.getElementById('auto-connect').addEventListener('click', () => {
  if (localStorage.getItem('auto-connect') === 'true') {
    localStorage.setItem('auto-connect', 'false');
    sendHeader('No longer connecting on start!', false);
  } else {
    localStorage.setItem('auto-connect', 'true');
    sendHeader('Will attempt to connect on start!', true);
  }
  updateSettings();
});

document
  .getElementById('save-connect-data')
  .addEventListener('click', () => {
    if (localStorage.getItem('save-connect-data') === 'true') {
      localStorage.setItem('save-connect-data', 'false');
      sendHeader('No longer saving network info!', false);
    } else {
      localStorage.setItem('save-connect-data', 'true');
      sendHeader(
        'Will save network info on successful connection!',
        true,
      );
    }
    updateSettings();
  });
