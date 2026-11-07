export function calculateDiscountedTotal(total, percent) { // Tính tổng tiền sau giảm giá
  if (!Number.isFinite(total) || total < 0) {
    throw new RangeError('Invalid total amount');
  }

  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new RangeError('Discount percentage must be between 0 and 100');
  }

  return total * (1 - percent / 100);
}