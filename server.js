var requestHandler = require('./lib/_request_handler'),
    options = require('./config/options'),
    port = process.env.PORT || process.argv[2] || 8015;

if (options.ssl) {
  require('https').createServer(options.ssl, requestHandler).listen(port);
} else {
  require('http').createServer(requestHandler).listen(port);
}

console.log('Magic happens on port ' + port);
