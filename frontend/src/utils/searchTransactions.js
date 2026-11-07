export function searchTransactionsByAccount(transactions = [], keyword = '') {
  if (!Array.isArray(transactions)) return [];

  const query = String(keyword ?? '').trim().toLowerCase();

  return transactions.filter(tx =>
    tx && String(tx.account_id ?? '').toLowerCase().includes(query)
  );
}