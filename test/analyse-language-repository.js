const test = require('ava')

const I18n = require('../lib/i18n.js')

test('resourceKeys flat', t => {
  const i18n = new I18n()
  i18n.loadLocale('en', {
    greeting: 'Hello!'
  })

  t.deepEqual(i18n.resourceKeys('en'), [
    'greeting'
  ])
})

test('resourceKeys with depth', t => {
  const i18n = new I18n()
  i18n.loadLocale('en', {
    greeting: 'Hello!',
    foo: {
      bar: '42',
      hell: {
        devil: 666
      }
    }
  })

  t.deepEqual(i18n.resourceKeys('en'), [
    'greeting',
    'foo.bar',
    'foo.hell.devil'
  ])
})
