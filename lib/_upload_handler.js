var fs = require('fs'),
    request = require('request'),
    path = require('path'),
    url = require('url'),
    options = require('../config/options'),
    formidable = require('formidable'),
    readFile = require("fs").readFile,
    mkdirp = require('mkdirp'),
    qt = require('quickthumb'),
    FileInfo = require('./_file_info');

function UploadHandler (req, res, callback) {
  this.req = req;
  this.res = res;
  this.callback = callback;
}

/**
 * Get all upload files
 *
 */
UploadHandler.prototype.get = function () {
  var handler = this,
      files = [];
  var query = url.parse(handler.req.url,true).query;
  var uploadDir = options.uploadDir + '/' + (query.bucket?query.bucket:'default') + '/';
  //console.log(uploadDir);
  fs.readdir(uploadDir, function (err, list) {
    if(list && list.length){
      list.forEach(function (name) {
        var stats = fs.statSync(uploadDir + '/' + name),
            fileInfo;
        if (stats.isFile() && name[0] !== '.') {
          fileInfo = new FileInfo({
            name: name,
            size: stats.size
          });
          fileInfo.initUrl(handler.req);
          files.push(fileInfo);
        }
      });
      handler.callback({files: files});
    }
    else{
      handler.callback({error: "Bucket not found"});
    }
  });
}

UploadHandler.prototype.resize = function () {
  var handler = this,
      param = url.parse(handler.req.url,true).query;
  // Check for blacklist url
  if(options.blackListUrl && options.blackListUrl.length){
    for (var i = 0; i < options.blackListUrl.length; i++) {
      if(param.url.indexOf(options.blackListUrl[i]) >= 0){
        readFile(options.uploadDir + "/blacklist.jpg",function(err,data){
          handler.res.writeHead(200, {'Content-Type': 'image/jpg'});
          handler.res.end(data);
        });
        return;
      }
    }
  }
  var file = decodeURI(param.url.replace(/[^a-z0-9]/g, "-")),
      w = param.w || "-1",
      h = param.h || "-1",
      type = param.type || "crop",
      opts = {
          src : param.url,
          dst : path.join(options.tmpDir, type, w+"x"+h, file),
          //width : w,
          //height : h,
          type : type,
          quality : options.quality
      };
  if(w=="-1"){
    opts.height = h;
    opts.type="resize";
  }
  else{
    opts.width = w;
    if(h=="-1"){
      opts.type="resize";
    }
    else{
      opts.height = h;
    }
  }
  readFile(opts.dst,function(err,data){
    if(err){
        mkdirp(path.dirname(opts.dst));
        // check for https
        if(opts.src.startsWith("https://")){
          request(opts.src, {encoding: 'binary'}, function(error, response, body) {
            var temp = path.join(options.tmpDir, "https", file);
            mkdirp(path.dirname(temp));
            fs.writeFile(temp, body, 'binary', function (err) {
              opts.src=temp;
              convertQT(handler.res, opts);
            });
          });
        }
        else{
          convertQT(handler.res, opts);
        }
    }
    else{
            handler.res.writeHead(200, {'Content-Type': 'image/jpg'});
            handler.res.end(data);
    }
  });
}

var convertQT = function(res, opts){
        qt.convert(opts, function(err, dst){
          if (err){
            res.statusCode = 422;
            res.end("Invalid Filetype");
          }else{
            readFile(dst,function(err,data){
              res.writeHead(200, {'Content-Type': 'image/jpg'});
              res.end(data);
            });
          }
        });
}

/**
 * Post a new file
 *
 */
UploadHandler.prototype.post = function () {
  var handler = this,
      form = new formidable.IncomingForm(),
      tmpFiles = [],
      map = {},
      files = [],
      counter = 1,
      redirect,
      bucket = 'default',
      finish = function () {
        counter -= 1;
        if (!counter) {
          files.forEach(function (fileInfo) {
            fileInfo.initUrl(handler.req, bucket);
          });
          handler.callback({files: files}, redirect);
        }
      };

  form.uploadDir = options.tmpDir;

  form.on('fileBegin', function (name, file) {
      tmpFiles.push(file.path);
      var fileInfo = new FileInfo(file, handler.req, true);
      map[path.basename(file.path)] = fileInfo;
      fileInfo.safeName();
      files.push(fileInfo);
  }).on('field', function (name, value) {
      if (name === 'redirect') {
        redirect = value;
      }
      else if(name === 'bucket'){
        bucket = value;
      }
  }).on('file', function (name, file) {
      var fileInfo = map[path.basename(file.path)];
      fileInfo.size = file.size;
      if (!fileInfo.validate()) {
          fs.unlink(file.path);
          return;
      }
      var uploadPath = options.uploadDir + '/' + bucket  + '/';
      if (!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath);
      }
      fs.renameSync(file.path, uploadPath + fileInfo.name);
  }).on('aborted', function () {
    tmpFiles.forEach(function (file) {
      fs.unlink(file);
    });
  }).on('progress', function (bytesReceived) {
    if (bytesReceived > options.maxPostSize) {
      handler.req.socket.destroy();
    }
  }).on('error', function (e) {
    console.log(e);
  }).on('end', finish).parse(handler.req);
}

/**
 * Delete files
 *
 */
UploadHandler.prototype.destroy = function () {
  var handler = this,
      fileName,
      bucket;
  var url_sp = handler.req.url.split("/");

  console.log(url_sp);
  
  //if (handler.req.url.slice(0, options.deleteUrl.length) === options.deleteUrl) {
  if(url_sp.length == 4 && url_sp[1] == "del"){
    bucket = url_sp[2];
    fileName = url_sp[3];
    //fileName = path.basename(decodeURIComponent(handler.req.url));
    //var uploadPath = options.publicDir + '/' + hostname + options.uploadUrl + fileName;
    var uploadPath = options.uploadDir + '/' + bucket  + '/' + fileName;
    console.log("Delete url = " + uploadPath);
    if (fileName[0] !== '.') {
      fs.unlink(uploadPath, function (err) {
        handler.callback({success: !err});
      });
      return;
    }
  }
  handler.callback({success: false});
}

// Expose upload handler
module.exports = exports = UploadHandler;
