const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the workspace root, this can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

// Set EXPO_ROUTER_APP_ROOT environment variable
process.env.EXPO_ROUTER_APP_ROOT = path.join(projectRoot, 'app');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

// 4. Gesture handler resolver
config.resolver.alias = {
  'react-native-gesture-handler': 'react-native-gesture-handler/src',
};

module.exports = config; 