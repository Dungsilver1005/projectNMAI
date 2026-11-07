export function searchTransactionsByAccount(transactions = [], keyword = '') {
  if (!Array.isArray(transactions)) return [];

  const query = String(keyword ?? '').trim().toLowerCase();

  return transactions.filter(tx =>
    tx && String(tx.account_id ?? '').toLowerCase().includes(query)
  );
}

export function searchTransactionsByStatus(transactions = [], status = '') {
  if (!Array.isArray(transactions)) return [];

  const query = String(status ?? '').trim().toLowerCase();

  return transactions.filter(tx =>
    tx &&
    String(tx.transaction_status ?? tx.final_result ?? '')
      .toLowerCase()
      .includes(query)
  );
}

