const defaultColorPalette = [
  { name: 'red', hex: '#ff0000' },
  { name: 'orange', hex: '#ffa600' },
  { name: 'yellow', hex: '#ffff00' },
  { name: 'green', hex: '#00ff00' },
  { name: 'blue', hex: '#0000ff' },
  { name: 'purple', hex: '#ff00ff' },
  { name: 'indigo', hex: '#7b00ff' },
  { name: 'pink', hex: '#ff0059' },
  { name: 'coral', hex: '#ff3c00' },
  { name: 'emerald', hex: '#00ff77' },
  { name: 'cyan', hex: '#00ffff' },
  { name: 'azure', hex: '#0059ff' },
];

let deviceOn = false;
let deviceColor = '#FFFFFF';
let deviceBrightness = 50;
let activeInputField = null;
let selectedDeviceColor = null;

const lightColors = [];

let colorsActive;

const panelColorsParent = document.getElementById('panel-colors');

if (localStorage.getItem('last-on-colors') === 'light') {
  document.getElementById('color-palette').innerHTML = 'Your Palette';
  colorsActive = lightColors;
  createColors(colorsActive);
} else {
  document.getElementById('color-palette').innerHTML = 'Color Palette';
  colorsActive = defaultColorPalette;
  createColors(colorsActive);
}

function createColors(list, userInput) {
  panelColorsParent.innerHTML = ' ';
  list.forEach((color) => {
    const { name, hex } = color;

    const container = createButton(`${name}-light`, hex, name);
    panelColorsParent.appendChild(container.container);

    if (deviceColor === addHash(hex)) {
      selectedDeviceColor = container.button;
      container.button.innerHTML = checkmarkSvg;
    }

    container.button.addEventListener('click', () => {
      if (selectedDeviceColor) {
        selectedDeviceColor.innerHTML = '';
      }

      container.button.innerHTML = checkmarkSvg;

      selectedDeviceColor = container.button;

      const hsl = hexToHSL(hex);

      const request1 = axios({
        method: 'put',
        url: 'http://localhost:50212/hue',
        timeout: 2000,
        data: {
          host: localStorage.getItem('host'),
          auth: localStorage.getItem('auth'),
          hue: Number(Math.round(hsl.hue)),
        },
      });

      const request2 = axios({
        method: 'put',
        url: 'http://localhost:50212/sat',
        timeout: 2000,
        data: {
          host: localStorage.getItem('host'),
          auth: localStorage.getItem('auth'),
          sat: Number(Math.round(hsl.saturation)),
        },
      });

      Promise.all([request1, request2])
        .then(() => {
          sendHeader(`Set color to ${name}!`, true);
          fetchStatus();
        })
        .catch(() => {
          sendHeader('Failed to set color!', false);
          fetchStatus();
        });
    });
  });

  document.getElementById('xColorsButton').style.display = 'none';

  createCustomColors(userInput);
}

const panelEffects = [
  { name: 'Beatdrop', emoji: '🥁', backgroundColor: '#232323' },
  { name: 'Blaze', emoji: '🔥', backgroundColor: '#FF4500' },
  { name: 'Cocoa Beach', emoji: '🏖️', backgroundColor: '#FFEBCD' },
  { name: 'Cotton Candy', emoji: '🍬', backgroundColor: '#FFB6C1' },
  { name: 'Date Night', emoji: '🌃', backgroundColor: '#000080' },
  { name: 'Hip Hop', emoji: '🎧', backgroundColor: '#800080' },
  { name: 'Hot Sauce', emoji: '🌶️', backgroundColor: '#FF0000' },
  { name: 'Jungle', emoji: '🌴', backgroundColor: '#006400' },
  { name: 'Lightscape', emoji: '🌆', backgroundColor: '#FFD700' },
  { name: 'Morning Sky', emoji: '🌅', backgroundColor: '#FFA500' },
  { name: 'Northern Lights', emoji: '🌌', backgroundColor: '#4B0082' },
  { name: 'Pop Rocks', emoji: '🍭', backgroundColor: '#EE82EE' },
  { name: 'Prism', emoji: '🔮', backgroundColor: '#7B68EE' },
  { name: 'Starlight', emoji: '✨', backgroundColor: '#FFFF00' },
  { name: 'Sundown', emoji: '🌇', backgroundColor: '#FF8C00' },
  { name: 'Waterfall', emoji: '🌊', backgroundColor: '#00BFFF' },
];

const panelEffectsParent = document.getElementById('panel-effects');

panelEffects.forEach((effect) => {
  const { name, emoji, backgroundColor } = effect;

  const container = createButton(name, backgroundColor, name, emoji);
  panelEffectsParent.appendChild(container.container);

  container.button.addEventListener('click', () => {
    const request = axios({
      method: 'put',
      url: 'http://localhost:50212/effect',
      timeout: 2000,
      data: {
        host: localStorage.getItem('host'),
        auth: localStorage.getItem('auth'),
        effect: name,
      },
    });

    Promise.all([request])
      .then(() => {
        sendHeader(`Set effect to ${name.toLowerCase()}!`, true);
        fetchStatus();
      })
      .catch(() => {
        sendHeader('Failed to set effect!', false);
        fetchStatus();
      });
  });
});
