const Telegraf = require('telegraf')
const path = require('path')
const I18n = require('../lib/i18n')

const app = new Telegraf(process.env.BOT_TOKEN)

// For testing only.
// Information about current locale will be lost on app restart.
app.use(Telegraf.memorySession())

// Add middleware
const i18n = new I18n({
  directory: path.resolve(__dirname, 'locales'),
  defaultLanguage: 'en',
  sessionName: 'session'
})

app.use(i18n.middleware())

// Start message handler
app.start(({ i18n, reply }) => reply(i18n.t('greeting')))

// Set locale to `en`
app.command('en', ({ i18n, reply }) => {
  i18n.locale('en-US')
  return reply(i18n.t('greeting'))
})

// Set locale to `ru`
app.command('ru', ({ i18n, reply }) => {
  i18n.locale('ru')
  return reply(i18n.t('greeting'))
})

// Add apple to cart
app.command('add', ({ session, i18n, reply }) => {
  session.appleCount = session.appleCount || 0
  session.appleCount++
  const message = i18n.t('cart', {appleCount: session.appleCount})
  return reply(message)
})

// Add apple to cart
app.command('cart', (ctx) => {
  const message = ctx.i18n.t('cart', {appleCount: ctx.session.appleCount || 0})
  return ctx.reply(message)
})

// Checkout
app.command('checkout', ({ reply, i18n }) => reply(i18n.t('checkout')))

app.startPolling()
