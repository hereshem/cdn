var path = require('path'),
    basePath = path.resolve(__dirname, '..');

module.exports = {
  tmpDir: basePath + '/public/tmp',
  publicDir: basePath + '/public',
  uploadDir: basePath + '/public/res',
  uploadUrl: '/res/',
  deleteUrl: '/del/',
  minFileSize: 0.001,
  maxFileSize: 20485760, // 20MB
  maxPostSize: 20485760, // 20MB
  acceptFileTypes: /.+/i,
  imageTypes: /\.(gif|jpe?g|png|bmp|swf|mp3|ogg|mp4)$/i,
  imageVersions: {
    // 'thumbnails': {
    //   width: 80,
    //   height: 80
    // }
  },
  accessControl: {
    allowOrigin: '*',
    allowMethods: 'GET, POST, DELETE',
    allowHeaders: 'Content-Type, Content-Range, Content-Disposition'
  },
  blackListUrl:[
    // "hamro.com",
    // "appinnovation.com.np",
    // "routercheck.com"
  ],
  /*
  ssl: {
    key: '',
    cert: ''
  }
  */
  nodeStatic: {
    cache: 3600
  }
};
