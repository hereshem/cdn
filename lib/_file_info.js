var options = require('../config/options'),
    path = require('path');
    //fs = require('fs'),
    // _existsSync = fs.existsSync || path.existsSync,
    // nameCountRegexp = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/,
    // nameCountFunc = function (s, index, ext) {
    //   return ' (' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');
    // };


function FileInfo (file) {
  this.name = file.name;
  this.size = file.size;
  this.type = file.type;
  //this.deleteType = 'DELETE';
}

FileInfo.prototype.initUrl = function (host, bucket) {
  if (!this.error) {
    if(!bucket){
        bucket = "default";
    }
    var baseUrl = (options.ssl ? 'https:' : 'http:') +
          '//' + host + options.uploadUrl + bucket + '/';
    this.url = baseUrl + encodeURIComponent(this.name);    
  }
}

FileInfo.prototype.safeName = function () {
    this.name = new Date().getTime().toString()+'-'+Math.floor(Math.random()* 100)+path.extname(this.name);
}

FileInfo.prototype.validate = function () {
    if (options.minFileSize && options.minFileSize > this.size) {
        this.error = 'File is too small';
    }
    if (options.maxFileSize && options.maxFileSize < this.size) {
        this.error = 'File is too big';
    }
    if (!options.acceptFileTypes.test(this.type)) {
        this.error = 'File type not wrong';
    }

    return !this.error;
}

// Expose the file info module
module.exports = exports = FileInfo;
