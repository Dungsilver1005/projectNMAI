function formatTime(value) {
  if (!value) return '--';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit'
  }).format(new Date(value));
}

function riskTone(result, score = 0) {
  if (result === 'fraud' || score >= 0.75) return 'danger';
  if (score >= 0.45) return 'warning';
  return 'safe';
}