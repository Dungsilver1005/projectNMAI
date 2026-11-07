import test from 'node:test';
import assert from 'node:assert/strict';

import {
  sortTransactionsByAccount,
  sortTransactionsByAmount
} from '../frontend/src/utils/sortTransactions.js';

const transactions = [
  { account_id: 'C', amount: 300 },
  { account_id: 'A', amount: 100 },
  { account_id: 'B', amount: 200 }
];

test('sort transactions by account ID', () => {
  const result = sortTransactionsByAccount(transactions);

  assert.deepEqual(
    result.map(tx => tx.account_id),
    ['A', 'B', 'C']
  );
});

test('sort transactions by amount', () => {
  const result = sortTransactionsByAmount(transactions);

  assert.deepEqual(
    result.map(tx => tx.amount),
    [100, 200, 300]
  );
});

test('sorting should not modify original array', () => {
  const originalOrder = transactions.map(tx => tx.account_id);

  sortTransactionsByAmount(transactions);

  assert.deepEqual(
    transactions.map(tx => tx.account_id),
    originalOrder
  );
});