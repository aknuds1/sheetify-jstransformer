var jstransformer = require('jstransformer')
var identity = function(a) { return a }

module.exports = function sheetify_jstransform(filename, source, options, cb) {
  var transform = [].concat(options.transform)
  var current = source

  function runTransform() {
    try {
      var transformSingle = transform.shift()
      if (transformSingle == null) {
        return cb(null, current)
      }
      transformSingle = [].concat(transformSingle)
      var transformer = jstransformer(transformSingle[0])
      var matchesTransformer = transformer.inputFormats.some(function (format) {
        return RegExp('\.' + format + '$').test(filename)
      })
      if (!matchesTransformer) {
        runTransform()
        return
      }

      var opts = transformSingle[1] || {}
      opts.filename = filename
      var optsCb = transformSingle[2] || identity
      opts = optsCb(opts, filename)
      transformer.renderAsync(current, opts, {}, function(err, result) {
        if (err) {
          return cb(err)
        }
        current = result.body
        runTransform()
      })
    }
    catch (err) {
      cb(err)
    }
  }
  runTransform()
}
