const test = require('ava')

const I18n = require('../lib/i18n.js')

test('can translate', t => {
  const i18n = new I18n()
  i18n.loadLocale('en', {
    greeting: 'Hello!'
  })
  t.is(i18n.t('en', 'greeting'), 'Hello!')
})

test('allowMissing false throws', t => {
  const i18n = new I18n({
    allowMissing: false
  })
  t.throws(() => {
    i18n.t('en', 'greeting')
  }, 'telegraf-i18n: \'en.greeting\' not found')
})
