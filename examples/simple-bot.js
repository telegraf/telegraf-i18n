var Telegraf = require('telegraf')
var path = require('path')
var I18n = require('../lib/i18n')

var telegraf = new Telegraf(process.env.BOT_TOKEN)

// For testing only. Session will be lost on app restart
telegraf.use(Telegraf.memorySession())

// Add middleware
const i18n = new I18n({
  directory: path.resolve(__dirname, 'locales')
})
telegraf.use(i18n.middleware())

// Start bot
telegraf.hears('/start', (ctx) => {
  var message = ctx.i18n.t('greeting', {
    username: ctx.from.username
  })
  return ctx.reply(message)
})

// Set locale to `en`
telegraf.hears('/en', (ctx) => {
  ctx.i18n.locale('en')
})

// Set locale to `ru`
telegraf.hears('/ru', (ctx) => {
  ctx.i18n.locale('ru')
})

// Add apple to cart
telegraf.hears('/add', (ctx) => {
  ctx.session.appleCount = ctx.session.appleCount || 0
  ctx.session.appleCount++
  var message = ctx.i18n.t('cart', {appleCount: ctx.session.appleCount})
  return ctx.reply(message)
})

// Add apple to cart
telegraf.hears('/cart', (ctx) => {
  var message = ctx.i18n.t('cart', {appleCount: ctx.session.appleCount || 0})
  return ctx.reply(message)
})

// Random joke
telegraf.hears('/joke', (ctx) => {
  return ctx.reply(ctx.i18n.t('joke'))
})

telegraf.startPolling()
