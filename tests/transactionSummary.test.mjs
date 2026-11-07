import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTransactionSummary } from '../frontend/src/utils/transactionSummary.js';

test('should handle invalid transaction amount', () => {
  const transactions = [
    { account_id: 'ACC-01', amount: 'invalid', final_result: 'approved' }
  ];

  const result = formatTransactionSummary(transactions);

  assert.equal(result, '1. ACC-01 | -- VND | approved');
});

test('should format valid transaction amount', () => {
  const result = formatTransactionSummary([
    { account_id: 'ACC-01', amount: 150000, final_result: 'approved' }
  ]);

  assert.equal(result, '1. ACC-01 | 150.000 VND | approved');
});

test('should handle empty transaction list', () => {
  assert.equal(
    formatTransactionSummary([]),
    'Chưa có dữ liệu giao dịch'
  );
});

test('should handle null transaction', () => {
  assert.equal(
    formatTransactionSummary([null]),
    '1. -- | 0 VND | --'
  );
});