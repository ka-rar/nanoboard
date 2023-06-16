const checkmarkSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="svg-icon" height="1em" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>';

function createInputField(elementId, placeholder, length = 7, forceUppercase = false) {
  if (activeInputField) activeInputField.remove();

  const targetElement = document.getElementById(elementId);

  const rect = targetElement.getBoundingClientRect();
  const x = rect.left;
  const y = rect.top;

  const inputField = document.createElement('input');

  inputField.type = 'text';
  inputField.placeholder = placeholder;
  inputField.maxLength = length;
  inputField.classList.add('dropper-input');
  inputField.style.position = 'absolute';
  inputField.style.top = `${y + 30}px`;
  inputField.style.left = `${x - 42}px`;

  document.body.appendChild(inputField);

  inputField.focus();

  if (forceUppercase) {
    inputField.addEventListener('input', function () {
      const inputValue = this.value;
      this.value = inputValue.toUpperCase();
    });
  }

  document.addEventListener('click', (event) => {
    const clickedElement = event.target;
    if (
      clickedElement !== inputField
            && clickedElement !== targetElement
            && !targetElement.contains(clickedElement)
            && !inputField.contains(clickedElement)
    ) {
      inputField.remove();
    }
  });

  activeInputField = inputField;

  return inputField;
}

function hexToHSL(hex) {
  hex = hex.replace('#', '');

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let hue;
  if (max === min) {
    hue = 0; // Achromatic (gray)
  } else {
    const diff = max - min;
    switch (max) {
      case r:
        hue = ((g - b) / diff) % 6;
        break;
      case g:
        hue = (b - r) / diff + 2;
        break;
      case b:
        hue = (r - g) / diff + 4;
        break;
    }
    hue *= 60;
    if (hue < 0) {
      hue += 360;
    }
  }

  const lightness = (max + min) / 2;
  const saturation = max === min
    ? 0
    : Math.round(
      ((max - min) / (1 - Math.abs(2 * lightness - 1))) * 100,
    );

  return { hue, saturation };
}

function isValidIpAddress(ipAddress) {
  const ipAddressRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

  return ipAddressRegex.test(ipAddress);
}

function isValidAuthToken(authToken) {
  return authToken.length === 32;
}

function createButton(id, bg, name, innerHTML = '') {
  const button = document.createElement('button');
  button.id = id;
  button.className = 'button-hover small-button';
  button.style.backgroundColor = bg;
  button.innerHTML = innerHTML;

  const text = document.createElement('span');
  text.className = 'button-text inter-no-shad';
  text.innerText = name.charAt(0).toUpperCase() + name.slice(1);

  const container = document.createElement('div');
  container.className = 'button-container';
  container.appendChild(button);
  container.appendChild(text);

  button.addEventListener('mouseover', () => {
    text.style.opacity = '0.8';
  });

  button.addEventListener('mouseout', () => {
    text.style.opacity = '0';
  });

  return { container, button };
}

function hslToHex(hue, saturation) {
  const h = hue / 360;
  const s = saturation / 100;
  const l = 0.5;

  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - chroma / 2;

  let r; let g; let
    b;

  if (h >= 0 && h < 1 / 6) {
    r = chroma;
    g = x;
    b = 0;
  } else if (h >= 1 / 6 && h < 2 / 6) {
    r = x;
    g = chroma;
    b = 0;
  } else if (h >= 2 / 6 && h < 3 / 6) {
    r = 0;
    g = chroma;
    b = x;
  } else if (h >= 3 / 6 && h < 4 / 6) {
    r = 0;
    g = x;
    b = chroma;
  } else if (h >= 4 / 6 && h < 5 / 6) {
    r = x;
    g = 0;
    b = chroma;
  } else {
    r = chroma;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255)
    .toString(16)
    .padStart(2, '0');
  g = Math.round((g + m) * 255)
    .toString(16)
    .padStart(2, '0');
  b = Math.round((b + m) * 255)
    .toString(16)
    .padStart(2, '0');

  return `#${r}${g}${b}`;
}

function validateHex(hex) {
  const hexRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  return hexRegex.test(hex);
}

let timeoutID;

const sendUpdate = (body) => {
  const bannerMessage = document.getElementById('bannerMessage');

  if (timeoutID) {
    clearTimeout(timeoutID);
  }

  bannerMessage.innerHTML = `
    <div class="error slow-anim-up-fade-out">
        <div class="error-content-no-img inter">
            <p>${body}</p>
        </div>
    </div>`;

  timeoutID = setTimeout(() => {
    bannerMessage.innerHTML = '';
    timeoutID = null;
  }, 8000);
};

const sendNotificationRaw = (body, success = true) => {
  const type = success ? 'success' : 'error';
  const bannerMessage = document.getElementById('bannerMessage');

  if (timeoutID) {
    clearTimeout(timeoutID);
  }

  bannerMessage.innerHTML = `
    <div class="${type} animate-up-fade-out">
        <div class="${type}-content-no-img inter">
            <p><b>${body}</b></p>
        </div>
    </div>`;

  timeoutID = setTimeout(() => {
    bannerMessage.innerHTML = '';
    timeoutID = null;
  }, 2000);
};

const sendHeader = (body, success = false) => {
  const type = success ? 'success' : 'error';
  const bannerMessage = document.getElementById('bannerMessage');

  if (timeoutID) {
    clearTimeout(timeoutID);
  }

  bannerMessage.innerHTML = `
    <div class="${type} animate-up-fade-out">
        <span class="${type}-img"> ${
  success
    ? '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" height="1.1em" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>'
} </span>
        <div class="${type}-content inter">
            <p><b>${body}</b></p>
        </div>
    </div>`;

  timeoutID = setTimeout(() => {
    bannerMessage.innerHTML = '';
    timeoutID = null;
  }, 2000);
};

function addHash(hexString) {
  if (hexString.startsWith('#')) {
    return hexString;
  }

  return `#${hexString}`;
}
