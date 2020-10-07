import test from 'ava'

import {Config, Repository} from '../source'
import {I18nContext} from '../source/context'

const EXAMPLE_REPO: Readonly<Repository> = {
  en: {
    desk: () => 'desk',
    foo: () => 'bar'
  },
  de: {
    desk: () => 'Tisch'
  }
}

const MINIMAL_CONFIG: Config = {
  defaultLanguage: 'en',
  sessionName: 'session',
  templateData: {}
}

test('can get language', t => {
  const i18n = new I18nContext(EXAMPLE_REPO, MINIMAL_CONFIG, 'de', {})
  t.is(i18n.locale(), 'de')
})

test('can change language', t => {
  const i18n = new I18nContext(EXAMPLE_REPO, MINIMAL_CONFIG, 'de', {})
  t.is(i18n.locale(), 'de')
  i18n.locale('en')
  t.is(i18n.locale(), 'en')
})

test('can translate something', t => {
  const i18n = new I18nContext(EXAMPLE_REPO, MINIMAL_CONFIG, 'de', {})
  t.is(i18n.t('desk'), 'Tisch')
})

test('allowMissing', t => {
  const config: Config = {
    ...MINIMAL_CONFIG,
    allowMissing: true
  }

  const i18n = new I18nContext(EXAMPLE_REPO, config, 'de', {})
  t.is(i18n.t('unknown'), 'unknown')
})

test('defaultLanguageOnMissing', t => {
  const config: Config = {
    ...MINIMAL_CONFIG,
    defaultLanguageOnMissing: true
  }

  const i18n = new I18nContext(EXAMPLE_REPO, config, 'de', {})
  t.is(i18n.t('foo'), 'bar')
})
