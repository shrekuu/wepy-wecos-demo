var prod = process.env.NODE_ENV === 'production'
const cosBaseUrl = require('./wecos.config').baseUrl

// 生成一个随机字符串
function getRandomStr() {
  let result = ''
  while (!result) result = Math.random().toString(36).substr(2, 10)
  return result
}

// 处理指向 cos 的图片地址
const replacePlugin = [
  {
    // 将样式里指向 /cos/images 的背景图片地址指 cos 并加上随机字符串
    // 直接指向对象存储
    // 修改这里正则时注意前后行断言
    filter: /\.wxss/,
    config: {
      find: /(?<=background(-image)?:.*url\()[^)]+(?=\))/g,
      replace: function (match) {
        // 去掉引号
        if (/^('|")[^'"]+('|")$/.test(match)) {
          match = match.slice(1, -1)
        }

        // 本地图片
        if (/^\.\.\//.test(match)) {
          return match + '#' + getRandomStr()
        }

        // cos 图片
        if (/^\/cos\/images\//.test(match)) {
          return cosBaseUrl + match.substr(11) + '#' + getRandomStr()
        }

        return match + '#' + getRandomStr()
      }
    }
  },
  {
    // 将模版里指向 /cos/images 的地址指向 cos 并加上随机字符串
    // 将类似 ../images 本地图片一地址加上随机字符串
    filter: /\.wxml/,
    config: {
      find: /(?<=src=")[^"]+(?=")/g,
      replace: function (match) {
        // 本地图片
        if (/^\.\.\//.test(match)) {
          return match + '#' + getRandomStr()
        }

        // cos 图片
        if (/^\/cos\/images\//.test(match)) {
          return cosBaseUrl + match.substr(11) + '#' + getRandomStr()
        }

        // 剩下的就是一些从 api 数据中取来的动态地址了, 不处理
        return match
      }
    }
  }
]

module.exports = {
  wpyExt: '.wpy',
  eslint: true,
  cliLogs: true,
  compilers: {
    less: {
      compress: true
    },
    /*sass: {
      outputStyle: 'compressed'
    },*/
    babel: {
      sourceMap: true,
      presets: [
        'env'
      ],
      plugins: [
        'babel-plugin-transform-class-properties',
        'transform-export-extensions',
        'syntax-export-extensions'
      ]
    }
  },
  plugins: {
    replace: replacePlugin
  },
  appConfig: {
    noPromiseAPI: ['createSelectorQuery']
  }
}

if (prod) {

  module.exports.cliLogs = false;

  delete module.exports.compilers.babel.sourcesMap;
  // 压缩sass
  // module.exports.compilers['sass'] = {outputStyle: 'compressed'}

  // 压缩less
  module.exports.compilers['less'] = {
    compress: true
  }

  // 压缩js
  module.exports.plugins = {
    uglifyjs: {
      filter: /\.js$/,
      config: {
      }
    },
    imagemin: {
      filter: /\.(jpg|png|jpeg)$/,
      config: {
        jpg: {
          quality: 80
        },
        png: {
          quality: 80
        }
      }
    }
  }
}
