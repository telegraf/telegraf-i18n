# i18n for grammY and Telegraf

Internationalization middleware for [grammY](github.com/grammyjs/grammy) and [Telegraf](https://github.com/telegraf/telegraf).

## Installation

```bash
npm install telegraf-i18n
```

## Example

```plaintext
yaml and json are ok
Example directory structure:
├── locales
│   ├── en.yaml
│   ├── en-US.yaml
│   ├── it.json
│   └── ru.yaml
└── bot.js
```

```js
import * as path from 'path'

import {Telegraf, session} from 'telegraf'
import {I18n, pluralize} from 'telegraf-i18n'

const i18n = new I18n({
  defaultLanguageOnMissing: true, // implies allowMissing = true
  directory: path.resolve(__dirname, 'locales'),
  useSession: true,
})

// Also you can provide i18n data directly
i18n.loadLocale('en', {greeting: 'Hello!'})

const bot = new Telegraf(process.env['BOT_TOKEN']!)
bot.use(session())
bot.use(i18n.middleware())

// Start message handler
bot.command('start', async ctx => ctx.reply(ctx.i18n.t('greeting')))

bot.start()
```

A full example for both grammY and Telegraf are in the [examples folder](/examples).

## User context

Commonly used Context functions:

```ts
bot.use(ctx => {
  ctx.i18n.locale()                    // Get current locale
  ctx.i18n.locale(code)                // Set current locale
  ctx.i18n.t(resourceKey, [data])      // Get resource value (data will be used by template engine)
});
```
