const Telegraf = require('telegraf')
const path = require('path')
const I18n = require('../lib/i18n')
const { Extra } = Telegraf

// i18n options
const i18n = new I18n({
  directory: path.resolve(__dirname, 'locales'),
  defaultLanguage: 'en',
  sessionName: 'session',
  useSession: true,
  templateData: {
    pluralize: I18n.pluralize,
    uppercase: (value) => value.toUpperCase()
  }
})

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.use(Telegraf.session())
bot.use(i18n.middleware())

// Start message handler
bot.start(({ i18n, replyWithHTML }) => replyWithHTML(i18n.t('greeting')))

// Using i18n helpers
bot.command('help', I18n.reply('greeting', Extra.HTML()))

// Set locale to `en`
bot.command('en', ({ i18n, replyWithHTML }) => {
  i18n.locale('en-US')
  return replyWithHTML(i18n.t('greeting'))
})

// Set locale to `ru`
bot.command('ru', ({ i18n, replyWithHTML }) => {
  i18n.locale('ru')
  return replyWithHTML(i18n.t('greeting'))
})

// Add apple to cart
bot.command('add', ({ session, i18n, reply }) => {
  session.apples = session.apples || 0
  session.apples++
  const message = i18n.t('cart', { apples: session.apples })
  return reply(message)
})

// Add apple to cart
bot.command('cart', (ctx) => {
  const message = ctx.i18n.t('cart', { apples: ctx.session.apples || 0 })
  return ctx.reply(message)
})

// Checkout
bot.command('checkout', ({ reply, i18n }) => reply(i18n.t('checkout')))
bot.startPolling()
