var path = require('path'),
    basePath = path.resolve(__dirname, '..');

module.exports = {
  tmpDir: basePath + '/tmp',
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
    allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE',
    allowHeaders: 'Content-Type, Content-Range, Content-Disposition'
  },
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
