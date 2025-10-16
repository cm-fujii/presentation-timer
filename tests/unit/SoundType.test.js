/**
 * @file SoundType.test.js
 * @description SoundType enum のユニットテスト
 */

import { describe, it, expect } from 'vitest';
import { SoundType, isValidSoundType } from '../../js/models/SoundType.js';

describe('SoundType', () => {
  describe('Enum values', () => {
    it('should have BELL constant with value "bell"', () => {
      expect(SoundType.BELL).toBe('bell');
    });

    it('should have GONG constant with value "gong"', () => {
      expect(SoundType.GONG).toBe('gong');
    });

    it('should be frozen and immutable', () => {
      expect(Object.isFrozen(SoundType)).toBe(true);

      // オブジェクトの変更を試みても失敗する
      expect(() => {
        SoundType.BELL = 'modified';
      }).toThrow();

      expect(() => {
        SoundType.NEW_SOUND = 'new';
      }).toThrow();

      // 値が変更されていないことを確認
      expect(SoundType.BELL).toBe('bell');
    });

    it('should contain exactly two sound types', () => {
      const keys = Object.keys(SoundType);
      expect(keys.length).toBe(2);
      expect(keys).toContain('BELL');
      expect(keys).toContain('GONG');
    });

    it('should have unique values', () => {
      const values = Object.values(SoundType);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe('isValidSoundType', () => {
    it('should return true for valid sound types', () => {
      expect(isValidSoundType(SoundType.BELL)).toBe(true);
      expect(isValidSoundType(SoundType.GONG)).toBe(true);
      expect(isValidSoundType('bell')).toBe(true);
      expect(isValidSoundType('gong')).toBe(true);
    });

    it('should return false for invalid sound types', () => {
      expect(isValidSoundType('invalid')).toBe(false);
      expect(isValidSoundType('chime')).toBe(false);
      expect(isValidSoundType('BELL')).toBe(false); // 大文字は無効
      expect(isValidSoundType('GONG')).toBe(false); // 大文字は無効
      expect(isValidSoundType('')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isValidSoundType(null)).toBe(false);
      expect(isValidSoundType(undefined)).toBe(false);
      expect(isValidSoundType(123)).toBe(false);
      expect(isValidSoundType({})).toBe(false);
      expect(isValidSoundType([])).toBe(false);
      expect(isValidSoundType(true)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidSoundType(' bell')).toBe(false); // 前後の空白
      expect(isValidSoundType('bell ')).toBe(false);
      expect(isValidSoundType(' bell ')).toBe(false);
    });
  });
});
