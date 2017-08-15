var options = require('../config/options'),
    UploadHandler = require('./_upload_handler');

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
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify(result));
        }
      },
      handler = new UploadHandler(req, res, handleResult);
      console.log(new Date().toISOString().replace(/T/,' ')+" - "+req.method+" :: "+req.headers.host+req.url+" by "+req.headers['user-agent']);
  
  switch (req.method) {
    case 'OPTIONS':
      res.end();  
      break;
    case 'GET':
      if (req.url.startsWith("/resize")) {
        handler.resize();
      }else if (req.url.startsWith("/list?type=html")) {
        setNoCacheHeaders();
        handler.getList();
      }else if (req.url.startsWith("/list?type=bucket")) {
        setNoCacheHeaders();
        handler.getBuckets();
      }else if (req.url.startsWith("/list")) {
        setNoCacheHeaders();
        handler.get();
      }else if (req.url.startsWith("/res/")) {
        handler.serve();
      }else{
        res.statusCode = 404;
        res.end("Not Found !!!");
      }
      break;
    case 'POST':
      if(req.url.startsWith("/post")) {
        setNoCacheHeaders();
        handler.post();
      }
      else{
        res.statusCode = 404;
        res.end("not allowed");
      }
      break;
    case 'DELETE':
      handler.destroy();
      break;
    default:
      res.statusCode = 405;
      res.end();
  }
}
