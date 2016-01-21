var options = require('../config/options'),
    nodeStatic = require('node-static'),
    UploadHandler = require('./_upload_handler'),
    path = require('path'),
    readFile = require("fs").readFile,
    fileServer = new nodeStatic.Server(options.publicDir, options.nodeStatic);

module.exports = function (req, res) {

  // Set headers
  res.setHeader(
      'Access-Control-Allow-Origin',
      options.accessControl.allowOrigin
  );

  res.setHeader(
      'Access-Control-Allow-Methods',
      options.accessControl.allowMethods
  );

  res.setHeader(
      'Access-Control-Allow-Headers',
      options.accessControl.allowHeaders
  );

  var setNoCacheHeaders = function () {
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');
        res.setHeader('Expires', '0');
        res.setHeader('Content-Disposition', 'inline; filename="files.json"');
      },
      utf8encode = function (str) {
        return unescape(encodeURIComponent(str));
      },
      handleResult = function (result, redirect) {
        if (redirect) {
          res.writeHead(302, {
            'Location': redirect.replace(
              /%s/,
              encodeURIComponent(JSON.stringify(result))
            )
          });
          res.end();
        } else {
          if (req.headers.accept) {
            res.writeHead(200, {
              'Content-Type': req.headers.accept
              .indexOf('application/json') !== -1 ?
              'application/json' : 'text/plain'});
          } else {
            res.writeHead(200, {'Content-Type': 'application/json'});
          }
          res.end(JSON.stringify(result));
        }
      },
      handler = new UploadHandler(req, res, handleResult);
      console.log(new Date().toISOString().replace(/T/,' ')+" - "+req.method+" :: "+req.headers.host+req.url+" by "+req.headers['user-agent']);
  switch (req.method) {
    case 'OPTIONS':
      res.end();
      break;
    case 'HEAD':
    case 'GET':
      if (req.url === '/list') {
        setNoCacheHeaders();
        if (req.method === 'GET') {
          handler.get();
        } else {
          res.end();
        }
      }else if(req.url === '/'){
        // res.send('Not Found !!!');
        res.statusCode = 400;
        res.end("Not Found !!!");
      } else {
        var hostname = ( req.headers.host.match(/:/g) ) ? req.headers.host.slice( 0, req.headers.host.indexOf(":") ) : req.headers.host;
        var filePath = options.publicDir + '/' + hostname + req.url;
          readFile(filePath,function(err,data){
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.end(data);
          });
        //fileServer.serve(req, res);
      }
      break;
    case 'POST':
      setNoCacheHeaders();
      handler.post();
      break;
    case 'DELETE':
      handler.destroy();
      break;
    default:
      res.statusCode = 405;
      res.end();
  }

  fileServer.respond = function (pathname, status, _headers, files, stat, req, res, finish) {
    _headers['X-Content-Type-Options'] = 'nosniff';
    if (!options.imageTypes.test(files[0])) {
      _headers['Content-Type'] = 'application/octet-stream';
      _headers['Content-Disposition'] = 'attachment; filename="' +
        utf8encode(path.basename(files[0])) + '"';
    }
    nodeStatic.Server.prototype.respond.call(this, pathname, status, _headers, files, stat, req, res, finish);
  };
}
