const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Get the default Expo Metro config
const config = getDefaultConfig(__dirname);

// Export the config with NativeWind integration
module.exports = withNativeWind(config, { 
  input: './app/global.css' 
});