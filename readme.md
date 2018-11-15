## 在 WePY 项目里使用 WECOS 将 "所有" 图片放在腾讯对象存储里


> `tabbar` 里的图片只能放在本地.
> 先准备好对象存储 `bucket`, 然后克隆此项目开始.

---

### Step 1

全局安装 `wecos`

```bash
npm install -g wecos
```

### Step 2

复制 `wecos.config.json.example` 为 `wecos.config.json` 然后在里面填写对象存储的配置信息.

### Step 3

修改编译配置, 在 `wepy.config.js` 里增加 url 替换正则. 此项目中已建好, 不需要修改.

```js

// 开始复制
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
// 复制结束

// 然后把这个 replacePlugin 加到下面 plugins 数组中, 如下
module.exports = {
  // ...
  plugins: {
    replace: replacePlugin
  }
  // ...
}

```

### Step 3

新建如下目录结构, 此项目中已建好, 不需要修改.

```
.
├── cos
│   ├── images   // 上传后的图片会被移动到这里
│   │   └── logo.jpg
│   └── upload   // 要上传的时候把图放在这里
```

配置完毕.

## 如何使用

要上传图片时执行:

```bash
wecos
```

在样式与标签中使用:

```html
<style lang="less">
  .background-luxun {
    background-image: url(/cos/images/luxun.png);
  }
</style>
<template>
  <view class="container">
    <text>Hello world</text>
    <view class="background-luxun">background image from cos</view>
    <image class="luxun" mode="widthFix" src="/cos/images/luxun.jpg"></image>
  </view>
</template>
```

'/cos/images/luxun.jpg' 这样的字符串在 wepy 编译时会被替换成类似
`https://abc-1234567890.cos.ap-beijing.myqcloud.com/mina/luxun.jpg#8eanc5np4i`

## 记得不要把 `wecos.config.json` 推入仓库. 把它加入 `.gitignore` 中. 此项目已修改.

> 你会发现写地址时编辑器会有地址自动提示, 这当然是极好的.



