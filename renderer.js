module.exports = render
render.directories = directories
render.stylesheets = stylesheets
render.pages = pages
render.assets = assets

var jade = require('jade')
  , stylus = require('stylus')
  , nib = require('nib')
  , fs = require('fs')
  , colors = require('colors')
  , connect = require('connect')
  , fs = require('fs')
  , async = require('async')
  , mkdirp = require('mkdirp')
  , ncp = require('ncp').ncp
  , dir = process.env.PWD
  , config = require(dir + '/config')

// var timings = []
//   , start = new Date()
// function bench(note) {
//   timings.push(note + ' ' + (new Date() - start))
// }

/*
 * Create all of the directories.
 */
function directories(cb) {

  // Create the required directory structure
  async.forEach
    ([ '/preview/resource/css'
     ]
    , function (d, callback) {
      mkdirp(dir + d, callback)
      // bench('dir')
    }
    , cb)

}

/**
 * Loop over stylesheets and render them
 * to the preview and to the ouput dirs
 */
function stylesheets(cb) {

  async.forEach(config.stylesheets, function (ss, callback) {
    // bench('pre stylus')
    fs.readFile(dir + '/source/resource/css/' + ss + '.styl', 'utf8', function (err, data) {
      if (err) return callback(err)
      stylus(data)
        .set('filename', dir + '/source/resource/css/' + ss + '.styl')
        .set('compress', config.compressCSS)
        .use(nib())
        .render(function(err, css) {
          if (err) return callback(err)
          async.parallel([
            function (callback) {
              fs.writeFile(dir + '/preview/resource/css/' + ss + '.css', css, callback)
            }
            ],
            function (err) {
              if (!err) {
                console.log(('  Rendered ' + ss + '.styl → ' + ss + '.css').blue)
              }
              // bench('post stylus')
              callback(err)
            }
          )
        })

    })
  }, cb)

}


/**
 * Loop over pages and render them
 * to the preview dir
 */
function pages(cb) {

  async.forEach(config.pages, function (p, callback) {
    // bench('pre page')
    var readLoc = dir + '/source/templates/pages/' + p.template + '.jade'
      , writeLoc = dir + '/preview/' + p.template + '.html'

    fs.readFile(readLoc, 'utf8', function (err, data) {
      if (err) return callback(err)
      var template = jade.compile(data,
        { filename: readLoc
        , pretty: true
        })

      fs.writeFile(writeLoc, template(p.data), function (err) {
        if (!err) {
          console.log(('  Rendered ' + p.template + '.jade → ' + p.template + '.html').blue)
        }
        // bench('post page')
        callback(err)
      })

    })

  }, cb)

}


/*
 * Copy all non-css and non-hidden static assets over
 */
function assets(cb) {

  fs.readdir(dir + '/source/resource', function (err, files) {
    if (err) return cb(err)
    async.forEach(files, function (file, callback) {
      if (file !== 'css' && !/^\./.test(file)) {
        async.parallel([
          function (callback) {
            ncp(
              dir + '/source/resource/' + file,
              dir + '/preview/resource/' + file,
              function (err) {
                if (err) return callback(err)
                console.log(('  Copied ' + file + ' to preview').blue)
                callback()
              }
            )
          }], callback)
      } else {
        callback()
      }
    }, cb)
  })
}

/**
 * Render the static assets
 */
function render(cb) {

  console.log()

  directories(function (err) {
    if (err) throw err

    async.parallel
      ([ stylesheets, pages, assets]
      , function (err) {
          if (err) throw err
          console.log('\n  Render complete'.green)
          console.log()
          if (typeof cb === 'function') cb()
        }
      )

  })
}

// Render if this
// file is run directly
if (!module.parent) {
  render()
}