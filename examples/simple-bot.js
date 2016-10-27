const Telegraf = require('telegraf')
const path = require('path')
const I18n = require('../lib/i18n')

const app = new Telegraf(process.env.BOT_TOKEN)

// For testing only. Information about current locale will be lost on app restart
app.use(Telegraf.memorySession())

// Add middleware
const i18n = new I18n({
  directory: path.resolve(__dirname, 'locales')
})

app.use(i18n.middleware())

// Start bot
app.command('/start', (ctx) => {
  const message = ctx.i18n.t('greeting', {
    username: ctx.from.username
  })
  return ctx.reply(message)
})

// Set locale to `en`
app.command('/en', (ctx) => ctx.i18n.locale('en'))

// Set locale to `ru`
app.command('/ru', (ctx) => ctx.i18n.locale('ru'))

// Add apple to cart
app.command('/add', (ctx) => {
  ctx.session.appleCount = ctx.session.appleCount || 0
  ctx.session.appleCount++
  const message = ctx.i18n.t('cart', {appleCount: ctx.session.appleCount})
  return ctx.reply(message)
})

// Add apple to cart
app.command('/cart', (ctx) => {
  const message = ctx.i18n.t('cart', {appleCount: ctx.session.appleCount || 0})
  return ctx.reply(message)
})

app.startPolling()
