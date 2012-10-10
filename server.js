module.exports = serve

var fs = require('fs')
  , connect = require('connect')
  , dir = process.env.PWD
  , config = require(dir + '/config')

function serve() {

  function router(req, res, next) {
    var route = config.routes[req.url]
    if (route) {
      fs.createReadStream(dir + '/preview/' + route + '.html').pipe(res)
    } else {
      next()
    }
  }

  var server = connect()
    .use(connect.logger('dev'))
    .use(router)
    .use(connect.static(dir + '/preview'))
    .listen(config.port || 3000)

  console.log(
  [ ''
  , '  Connect server listening on http://localhost:' + server.address().port
  , ''
  , '  Available routes:'
  , '  `' + Object.keys(config.routes).join('`, `') + '`'
  , ''
  ].join('\n')
  )

}

// Run the server if this
// file is run directly
if (!module.parent) {
  serve()
}