const fs = require('fs');
const path = require('path');

const {
  setIconAsync,
} = require('@expo/prebuild-config/build/plugins/icons/withAndroidIcons');
const {
  setSplashImageDrawablesAsync,
} = require('@expo/prebuild-config/build/plugins/unversioned/expo-splash-screen/withAndroidSplashImages');

const projectRoot = path.resolve(__dirname, '..');
const appConfigPath = path.join(projectRoot, 'app.json');
const colorsPath = path.join(
  projectRoot,
  'android',
  'app',
  'src',
  'main',
  'res',
  'values',
  'colors.xml'
);

function toProjectAsset(assetPath) {
  return assetPath ? path.join(projectRoot, assetPath) : null;
}

function upsertColor(xml, name, value) {
  const colorTag = new RegExp(
    `(<color\\s+name="${name}"\\s*>)([^<]*)(</color>)`,
    'i'
  );

  if (colorTag.test(xml)) {
    return xml.replace(colorTag, `$1${value}$3`);
  }

  return xml.replace('</resources>', `  <color name="${name}">${value}</color>\n</resources>`);
}

async function main() {
  const { expo } = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));
  const adaptiveIcon = expo.android && expo.android.adaptiveIcon;
  const foregroundImage = adaptiveIcon && adaptiveIcon.foregroundImage;
  const icon = foregroundImage || expo.icon;
  const iconBackground =
    (adaptiveIcon && adaptiveIcon.backgroundColor) || '#ffffff';
  const splashBackground =
    (expo.splash && expo.splash.backgroundColor) || '#ffffff';

  if (!icon) {
    throw new Error('No Expo icon was configured in app.json.');
  }

  await setIconAsync(projectRoot, {
    icon: toProjectAsset(icon),
    backgroundColor: iconBackground,
    backgroundImage: toProjectAsset(adaptiveIcon && adaptiveIcon.backgroundImage),
    monochromeImage: toProjectAsset(adaptiveIcon && adaptiveIcon.monochromeImage),
    isAdaptive: Boolean(adaptiveIcon),
  });

  if (expo.splash && expo.splash.image) {
    await setSplashImageDrawablesAsync(
      expo,
      null,
      projectRoot,
      expo.splash.imageWidth || 200
    );
  }

  let colorsXml = fs.readFileSync(colorsPath, 'utf8');
  colorsXml = upsertColor(colorsXml, 'iconBackground', iconBackground);
  colorsXml = upsertColor(colorsXml, 'splashscreen_background', splashBackground);
  fs.writeFileSync(colorsPath, colorsXml);

  console.log('Android launcher and splash assets were regenerated from app.json.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
