const createExpoWebpackConfigAsync = require('@expo/webpack-config');

// module.exports = async function (env, argv) {
//   const config = await createExpoWebpackConfigAsync(env, argv);
//   // Customize the config before returning it.
//   return config;
// };


module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // Customize the config before returning it.

  config.resolve.alias['react-native-maps'] = '@alamoweb/react-native-web-mapview';

  return config;
};




// Fix attempt for maps 
// module.exports = async function (env, argv) {
//   const config = await createExpoWebpackConfigAsync(env, argv);

//   config.resolve.alias['react-native-maps'] = '@teovilla/react-native-web-maps';

//   return config;
// };