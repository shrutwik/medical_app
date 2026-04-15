const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

if (!config.resolver.assetExts.includes('pptx')) {
  config.resolver.assetExts.push('pptx');
}

module.exports = config;
