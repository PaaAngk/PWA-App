module.exports = {
    pwa: {
        name: 'PWA App', 
        themeColor: '#4DBA87',
        msTileColor: '#000000',
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black',
        manifestOptions: {
            start_url: '/'
        },
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
            swSrc: './src/sw.js',
            swDest: 'service-worker.js',
        }
    }
};
   