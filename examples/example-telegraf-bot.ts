import * as path from 'path'

import {Telegraf, Context as BaseContext, session} from 'telegraf'

import {I18n, pluralize, I18nContext} from '../source'

interface Session {
  apples?: number;
}

interface MyContext extends BaseContext {
  readonly i18n: I18nContext;
  session: Session;
}

// I18n options
const i18n = new I18n({
  directory: path.resolve(__dirname, 'locales'),
  defaultLanguage: 'en',
  sessionName: 'session',
  useSession: true,
  templateData: {
    pluralize,
    uppercase: (value: string) => value.toUpperCase(),
  },
})

const bot = new Telegraf<MyContext>(process.env['BOT_TOKEN']!)
bot.use(session())
bot.use(i18n.middleware())

// Start message handler
bot.command('start', async ctx => ctx.reply(ctx.i18n.t('greeting'), {parse_mode: 'HTML'}))

// Set locale to `en`
bot.command('en', async ctx => {
  ctx.i18n.locale('en-US')
  return ctx.reply(ctx.i18n.t('greeting'), {parse_mode: 'HTML'})
})

// Set locale to `ru`
bot.command('ru', async ctx => {
  ctx.i18n.locale('ru')
  return ctx.reply(ctx.i18n.t('greeting'), {parse_mode: 'HTML'})
})

// Add apple to cart
bot.command('add', async ctx => {
  ctx.session.apples = ctx.session.apples ?? 0
  ctx.session.apples++
  const message = ctx.i18n.t('cart', {apples: ctx.session.apples})
  return ctx.reply(message)
})

// Add apple to cart
bot.command('cart', async ctx => {
  const message = ctx.i18n.t('cart', {apples: ctx.session.apples ?? 0})
  return ctx.reply(message)
})

// Checkout
bot.command('checkout', async ctx => ctx.reply(ctx.i18n.t('checkout')))

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bot.launch()
