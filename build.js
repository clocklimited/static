var serve = require('./server.js')
  , render = require('./renderer.js')

module.exports = renderThenServe

function renderThenServe() {
  render(serve)
}

renderThenServe.render = render
renderThenServe.serve = serve