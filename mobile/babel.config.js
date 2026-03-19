module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/lib': './src/lib',
            '@/hooks': './src/hooks',
            '@/theme': './src/theme',
            '@/types': './src/types',
          },
        },
      ],
    ],
  };
};
