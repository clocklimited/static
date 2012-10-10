# Build and preview static sites

```
npm install git://github.com/clocklimited/static.git
```

In development (render and serve):

```js
var build = require('static')
build()
```

Just render:

```js
var build = require('static)
build.render()
```

Just serve:

```js
var build = require('static')
build.serve()
```