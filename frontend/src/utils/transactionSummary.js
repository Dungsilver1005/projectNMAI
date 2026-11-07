export function formatTransactionSummary(transactions = []) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return 'Chưa có dữ liệu giao dịch';
  }

  return transactions.map((rawTx, index) => {
  const tx = rawTx ?? {};
    const amount = Number(tx.amount ?? 0).toLocaleString('vi-VN');

    return `${index + 1}. ${tx.account_id ?? '--'} | ${amount} VND | ${tx.transaction_status ?? tx.final_result ?? '--'}`;
  }).join('\n');
}