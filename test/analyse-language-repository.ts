import test from 'ava'

import {I18n} from '../source/i18n'

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

test('resourceKeys of not existing locale are empty', t => {
  const i18n = new I18n()
  i18n.loadLocale('en', {
    greeting: 'Hello!'
  })

  t.deepEqual(i18n.resourceKeys('de'), [])
})

function createMultiLanguageExample() {
  const i18n = new I18n()
  i18n.loadLocale('en', {
    greeting: 'Hello!',
    checkout: 'Thank you!'
  })
  i18n.loadLocale('ru', {
    greeting: 'Привет!'
  })
  return i18n
}

test('availableLocales', t => {
  const i18n = createMultiLanguageExample()
  t.deepEqual(i18n.availableLocales(), [
    'en',
    'ru'
  ])
})

test('missingKeys ', t => {
  const i18n = createMultiLanguageExample()
  t.deepEqual(i18n.missingKeys('en', 'ru'), [])
  t.deepEqual(i18n.missingKeys('ru'), [
    'checkout'
  ])
})

test('overspecifiedKeys', t => {
  const i18n = createMultiLanguageExample()
  t.deepEqual(i18n.overspecifiedKeys('ru'), [])
  t.deepEqual(i18n.overspecifiedKeys('en', 'ru'), [
    'checkout'
  ])
})

test('translationProgress', t => {
  const i18n = createMultiLanguageExample()

  // 'checkout' is missing
  t.is(i18n.translationProgress('ru'), 0.5)

  // Overspecified (unneeded 'checkout') but everything required is there
  t.is(i18n.translationProgress('en', 'ru'), 1)
})
