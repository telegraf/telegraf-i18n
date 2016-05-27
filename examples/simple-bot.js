var Telegraf = require('telegraf')
var path = require('path')
var i18n = require('../lib/i18n')

var telegraf = new Telegraf(process.env.BOT_TOKEN)

// For testing only. Session will be lost on app restart
telegraf.use(Telegraf.memorySession())

// Add middleware
telegraf.use(i18n({
  directory: path.resolve(__dirname, 'locales')
}))

// Start bot
telegraf.on('/start', function * () {
  var message = this.i18n.t('greeting', {
    username: this.from.username
  })
  yield this.reply(message)
})

// Set locale to `en`
telegraf.hears('/en', function * () {
  this.i18n.locale('en')
})

// Set locale to `ru`
telegraf.hears('/ru', function * () {
  this.i18n.locale('ru')
})

// Add apple to cart
telegraf.hears('/add', function * () {
  this.session.appleCount = this.session.appleCount || 0
  this.session.appleCount++
  var message = this.i18n.t('cart', {appleCount: this.session.appleCount})
  yield this.reply(message)
})

// Add apple to cart
telegraf.hears('/cart', function * () {
  var message = this.i18n.t('cart', {appleCount: this.session.appleCount || 0})
  yield this.reply(message)
})

// Random joke
telegraf.hears('/joke', function * () {
  yield this.reply(this.i18n.t('joke'))
})

telegraf.startPolling()
