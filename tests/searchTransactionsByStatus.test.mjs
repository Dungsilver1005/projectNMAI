import test from 'node:test';
import assert from 'node:assert/strict';

import {
  searchTransactionsByStatus
} from '../frontend/src/utils/searchTransactions.js';

const transactions = [
  { account_id: 'A', transaction_status: 'Approved' },
  { account_id: 'B', transaction_status: 'Rejected' },
  { account_id: 'C', transaction_status: 'Approved' }
];

test('search transactions by status', () => {
  const result = searchTransactionsByStatus(transactions, 'approved');
  assert.equal(result.length, 2);
});

test('search should be case-insensitive', () => {
  const result = searchTransactionsByStatus(transactions, 'REJECTED');
  assert.equal(result.length, 1);
  assert.equal(result[0].account_id, 'B');
});

test('invalid transaction list returns empty array', () => {
  assert.deepEqual(searchTransactionsByStatus(null, 'approved'), []);
});
