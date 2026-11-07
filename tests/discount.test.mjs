import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDiscountedTotal } from '../frontend/src/utils/discount.js';

test('100 discounted by 20% should equal 80', () => {
  assert.equal(calculateDiscountedTotal(100, 20), 80);
});

test('discount percentage above 100 should throw an error', () => {
  assert.throws(
    () => calculateDiscountedTotal(100, 150),
    RangeError
  );
});