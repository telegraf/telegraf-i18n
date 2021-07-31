/*!
 * This is adapted from:
 *
 * tableize-object (https://github.com/jonschlinkert/tableize-object)
 *
 * Copyright (c) 2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

/**
 * Tableize `obj` by flattening its keys into dot-notation.
 * Example: {a: {b: value}} -> {'a.b': value}
 */
export function tableize(object: Record<string, unknown>): Record<string, string | number | bigint | boolean> {
  const target = {}
  flatten(target, object, '')
  return target
}

/**
 * Recursively flatten object keys to use dot-notation.
 */
function flatten(target: Record<string, string | number | bigint | boolean>, object: Record<string, unknown>, parent: string) {
  for (const [key, value] of Object.entries(object)) {
    const globalKey = parent + key

    if (typeof value === 'object' && value !== null) {
      flatten(target, value as any, globalKey + '.')
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean') {
      target[globalKey] = value
    } else {
      throw new TypeError(`Could not parse value of key ${globalKey}. It is a ${typeof value}.`)
    }
  }
}
