import { describe, it, expect } from 'vitest'
import { parseBoolean, parseNumber, parseNumberArray, parseString } from '../src/config.js'

// Helper functions for testing (we'll test the logic separately)
// Since the actual functions are not exported, we'll test via the config module

describe('Config Module', () => {
  describe('parseBoolean', () => {
    it('should return default value when input is undefined', () => {
      expect(parseBoolean(undefined, true)).toBe(true)
      expect(parseBoolean(undefined, false)).toBe(false)
    })

    it('should parse "true" string as true', () => {
      expect(parseBoolean('true', false)).toBe(true)
      expect(parseBoolean('TRUE', false)).toBe(true)
    })

    it('should parse "1" string as true', () => {
      expect(parseBoolean('1', false)).toBe(true)
    })

    it('should parse other strings as false', () => {
      expect(parseBoolean('false', true)).toBe(false)
      expect(parseBoolean('0', true)).toBe(false)
      expect(parseBoolean('random', true)).toBe(false)
    })
  })

  describe('parseNumber', () => {
    it('should return default value when input is undefined', () => {
      expect(parseNumber(undefined, 42)).toBe(42)
    })

    it('should parse valid number strings', () => {
      expect(parseNumber('123', 0)).toBe(123)
      expect(parseNumber('0', 42)).toBe(0)
    })

    it('should return default for invalid numbers', () => {
      expect(parseNumber('abc', 42)).toBe(42)
      expect(parseNumber('', 42)).toBe(42)
    })
  })

  describe('parseNumberArray', () => {
    it('should return undefined for undefined input', () => {
      expect(parseNumberArray(undefined)).toBeUndefined()
    })

    it('should parse comma-separated numbers', () => {
      expect(parseNumberArray('1,2,3')).toEqual([1, 2, 3])
    })

    it('should handle spaces', () => {
      expect(parseNumberArray('1, 2, 3')).toEqual([1, 2, 3])
    })

    it('should filter out NaN values', () => {
      expect(parseNumberArray('1,abc,3')).toEqual([1, 3])
    })
  })

  describe('parseString', () => {
    it('should return undefined for empty or undefined input', () => {
      expect(parseString(undefined)).toBeUndefined()
      expect(parseString('')).toBeUndefined()
    })

    it('should return the string for valid input', () => {
      expect(parseString('hello')).toBe('hello')
    })
  })
})
