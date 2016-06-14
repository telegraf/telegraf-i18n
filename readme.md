# i18n for Telegraf

[![Build Status](https://img.shields.io/travis/telegraf/telegraf-i18n.svg?branch=master&style=flat-square)](https://travis-ci.org/telegraf/telegraf-i18n)
[![NPM Version](https://img.shields.io/npm/v/telegraf-i18n.svg?style=flat-square)](https://www.npmjs.com/package/telegraf-i18n)

Internationalization middleware for [Telegraf (Telegram bot framework)](https://github.com/telegraf/telegraf).

## Installation

```js
$ npm install telegraf-i18n
```

## Example
  
```js
const Telegraf = require('telegraf')
const i18n = require('telegraf-i18n')

const app = new Telegraf(process.env.BOT_TOKEN)

// telegraf-i18n will save current locale setting in session(if available)
app.use(Telegraf.memorySession())

/* 
Add i18n middleware.
Directory structure:
├── locales
│   ├── en.yaml
│   ├── it.json
│   └── ru.yaml
└── bot.js
*/
app.use(i18n(
  defaultLocale: 'en',
  allowMissing: true,
  directory: path.resolve(__dirname, 'locales')
))

app.hears('/start', (ctx) => {
  const message = this.i18n.t('greeting', {
    username: this.from.username
  })
  return ctx.reply(message)
})

app.startPolling()
```

See full [example](/examples).

## User context

Telegraf user context props and functions:

```js
app.use((ctx) => {
  ctx.i18n.locale()                    // Get current locale 
  ctx.i18n.locale(code)                // Set current locale  
  ctx.i18n.t(resourceKey, [context])   // Get resource value (context will be used by Handlebars)
});
```

## License

The MIT License (MIT)

Copyright (c) 2016 Vitaly Domnikov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

