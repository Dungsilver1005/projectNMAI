export function sortTransactionsByAccount(transactions = []) {
  return [...transactions].sort((a, b) =>
    String(a?.account_id ?? '').localeCompare(
      String(b?.account_id ?? '')
    )
  );
}

export function sortTransactionsByAmount(transactions = []) {
  const getAmount = (tx) => {
    const amount = Number(tx?.amount ?? 0);
    return Number.isFinite(amount) ? amount : 0;
  };

  return [...transactions].sort(
    (a, b) => getAmount(a) - getAmount(b)
  );
}