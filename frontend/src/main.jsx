import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  AlertTriangle,
  Banknote,
  Bot,
  CheckCircle2,
  Clock3,
  CreditCard,
  Database,
  FileClock,
  Gauge,
  Landmark,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Wifi
} from 'lucide-react';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const REFRESH_MS = 4000;

const emptyForm = {
  account_id: 'ACC-102934',
  card_id: 'CARD-4432',
  customer_name: 'Nguyen Minh Anh',
  amount: 2500000,
  currency: 'VND',
  timestamp: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
  content: 'thanh toan hoa don dien nuoc',
  merchant: 'EVN',
  channel: 'mobile',
  location: 'Ho Chi Minh'
};

const money = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});
const number = new Intl.NumberFormat('vi-VN');

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.detail || `HTTP ${response.status}`);
  }
  return data;
}

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

function StatusPill({ label, icon: Icon, online }) {
  return (
    <div className={`status-pill ${online ? 'online' : 'offline'}`}>
      <span className="status-dot" />
      <Icon size={16} />
      <span>{label}</span>
    </div>
  );
}

function StatCard({ title, value, helper, icon: Icon, tone = 'neutral', progress }) {
  return (
    <article className="stat-card">
      <div className="stat-head">
        <p>{title}</p>
        <span className={`icon-box ${tone}`}>
          <Icon size={19} />
        </span>
      </div>
      <strong>{value}</strong>
      <small>{helper}</small>
      {typeof progress === 'number' && (
        <div className="progress">
          <span style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }} />
        </div>
      )}
    </article>
  );
}

function EventBadge({ type }) {
  const map = {
    transaction_blocked: ['Giao dịch chặn', 'danger'],
    card_blocked: ['Thẻ bị khóa', 'danger'],
    account_locked: ['TK bị khóa', 'danger'],
    manual_review: ['Chờ soát xét', 'warning']
  };
  const [label, tone] = map[type] || [type, 'neutral'];
  return <span className={`badge ${tone}`}>{label}</span>;
}

function App() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [latestDecision, setLatestDecision] = useState(null);
  const [opsLog, setOpsLog] = useState(['Dashboard khởi tạo, chờ dữ liệu từ API gateway']);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const avgRisk = Math.round((stats.average_risk_score || 0) * 100);
  const healthState = useMemo(() => ({
    backend: Boolean(health?.backend?.online),
    database: Boolean(health?.database?.online),
    ai: Boolean(health?.ai?.online && health?.ai?.model_loaded !== false)
  }), [health]);

  const pushLog = (message) => {
    setOpsLog((current) => [`[${new Date().toLocaleTimeString('vi-VN')}] ${message}`, ...current].slice(0, 32));
  };

  const loadAll = async ({ announce = false } = {}) => {
    try {
      const [healthRes, statsRes, txRes, eventRes] = await Promise.all([
        api('/api/health'),
        api('/api/transactions/stats'),
        api('/api/transactions?page=1&limit=12'),
        api('/api/fraud-events?page=1&limit=12')
      ]);

      setHealth(healthRes.data);
      setStats(statsRes.data);
      setTransactions(txRes.data || []);
      setEvents(eventRes.data || []);
      setLastRefresh(new Date());
      if (announce) pushLog('Đồng bộ dashboard thành công');
    } catch (error) {
      pushLog(`Lỗi đồng bộ: ${error.message}`);
    }
  };

  useEffect(() => {
    loadAll({ announce: true });
    const interval = setInterval(loadAll, REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  const setSample = (kind) => {
    if (kind === 'fraud') {
      setForm({
        ...emptyForm,
        account_id: 'ACC-778801',
        card_id: 'CARD-9001',
        customer_name: 'Tran Bao Long',
        amount: 860000000,
        content: 'tai khoan bi khoa xac minh otp qua link gap',
        merchant: 'Unknown Gateway',
        channel: 'internet_banking',
        location: 'Unknown IP'
      });
      return;
    }
    setForm(emptyForm);
  };

  const submitTransaction = async (event) => {
    event.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      amount: Number(form.amount),
      timestamp: new Date(form.timestamp).toISOString()
    };

    try {
      pushLog(`Gửi kiểm tra ${payload.account_id || 'unknown'} / ${money.format(payload.amount)}`);
      const response = await api('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setLatestDecision(response.data);
      const actions = response.data.enforcement_actions?.join(', ') || 'approved';
      pushLog(`Decision ${response.data.final_result.toUpperCase()} - ${actions}`);
      await loadAll();
    } catch (error) {
      pushLog(`Không thể phân tích giao dịch: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark"><Landmark size={24} /></div>
        <nav>
          <button className="active" title="Risk Operations"><Gauge size={21} /></button>
          <button title="Transactions"><Banknote size={21} /></button>
          <button title="Cards"><CreditCard size={21} /></button>
          <button title="Logs"><FileClock size={21} /></button>
        </nav>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Distributed Fraud Platform</span>
            <h1>Sentinel Risk Operations</h1>
          </div>
          <div className="status-row">
            <StatusPill label="Backend" icon={Wifi} online={healthState.backend} />
            <StatusPill label="MongoDB" icon={Database} online={healthState.database} />
            <StatusPill label="AI Service" icon={Bot} online={healthState.ai} />
          </div>
        </header>

        <section className="stats-grid">
          <StatCard title="Tổng giao dịch" value={number.format(stats.total || 0)} helper={lastRefresh ? `Cập nhật ${formatTime(lastRefresh)}` : 'Đang chờ dữ liệu'} icon={Activity} />
          <StatCard title="Giao dịch bị chặn" value={number.format(stats.blocked_transactions || 0)} helper={`${Math.round((stats.fraud_rate || 0) * 100)}% luồng xử lý`} icon={ShieldAlert} tone="danger" />
          <StatCard title="TK / Thẻ bị khóa" value={`${number.format(stats.locked_accounts_count || 0)} / ${number.format(stats.blocked_cards_count || 0)}`} helper={`${number.format(stats.enforcement_count || 0)} enforcement logs`} icon={LockKeyhole} tone="warning" />
          <StatCard title="Risk score TB" value={`${avgRisk}%`} helper={money.format(stats.fraud_amount || 0)} icon={Gauge} tone="safe" progress={avgRisk} />
        </section>

        <section className="main-grid">
          <form className="panel transaction-form" onSubmit={submitTransaction}>
            <div className="panel-title">
              <div>
                <h2>Kiểm tra giao dịch</h2>
                <p>Backend gọi AI microservice và ghi enforcement log</p>
              </div>
              <Search size={22} />
            </div>

            <div className="form-grid">
              <label>
                <span>Mã tài khoản</span>
                <input value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })} />
              </label>
              <label>
                <span>Mã thẻ</span>
                <input value={form.card_id} onChange={(e) => setForm({ ...form, card_id: e.target.value })} />
              </label>
              <label className="wide">
                <span>Khách hàng</span>
                <input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
              </label>
              <label>
                <span>Số tiền</span>
                <input type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </label>
              <label>
                <span>Thời gian</span>
                <input type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} required />
              </label>
              <label>
                <span>Kênh</span>
                <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                  <option value="mobile">Mobile</option>
                  <option value="internet_banking">Internet Banking</option>
                  <option value="atm">ATM</option>
                  <option value="pos">POS</option>
                  <option value="counter">Counter</option>
                  <option value="api">API</option>
                </select>
              </label>
              <label>
                <span>Merchant</span>
                <input value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} />
              </label>
              <label className="wide">
                <span>Vị trí</span>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </label>
              <label className="wide">
                <span>Nội dung</span>
                <textarea rows="4" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="secondary" onClick={() => setSample('normal')}>Mẫu an toàn</button>
              <button type="button" className="secondary" onClick={() => setSample('fraud')}>Mẫu rủi ro</button>
              <button type="submit" className="primary" disabled={loading}>
                {loading ? <RefreshCw className="spin" size={18} /> : <Search size={18} />}
                Phân tích
              </button>
            </div>
          </form>

          <section className="panel decision-panel">
            <div className="panel-title">
              <div>
                <h2>Quyết định mới nhất</h2>
                <p>Fraud decision + enforcement</p>
              </div>
              {latestDecision?.final_result === 'fraud' ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
            </div>
            {latestDecision ? (
              <>
                <div className={`decision-card ${riskTone(latestDecision.final_result, latestDecision.risk_score)}`}>
                  <strong>{latestDecision.final_result === 'fraud' ? 'Giao dịch bị chặn' : 'Giao dịch được duyệt'}</strong>
                  <span>{Math.round((latestDecision.risk_score || 0) * 100)}% risk score</span>
                </div>
                <div className="decision-list">
                  <p><b>Rule:</b> {latestDecision.rule_based_result}</p>
                  <p><b>AI:</b> {latestDecision.ai_result}</p>
                  <p><b>Actions:</b> {latestDecision.enforcement_actions?.join(', ') || 'approved'}</p>
                  <p><b>Notes:</b> {latestDecision.decision_notes?.join(' | ')}</p>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <Clock3 size={28} />
                <p>Chưa có giao dịch nào được phân tích trong phiên này.</p>
              </div>
            )}
          </section>
        </section>

        <section className="bottom-grid">
          <section className="panel table-panel">
            <div className="panel-title compact">
              <div>
                <h2>Giao dịch mới nhất</h2>
                <p>Polling từ backend API</p>
              </div>
              <button className="icon-action" onClick={() => loadAll({ announce: true })}><RefreshCw size={18} /></button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Trạng thái</th>
                    <th>Tài khoản</th>
                    <th>Thẻ</th>
                    <th>Số tiền</th>
                    <th>Risk</th>
                    <th>Nội dung</th>
                    <th>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td><span className={`badge ${riskTone(tx.final_result, tx.risk_score)}`}>{tx.transaction_status || tx.final_result}</span></td>
                      <td>{tx.account_id || '--'}</td>
                      <td>{tx.card_id || '--'}</td>
                      <td className="strong">{money.format(tx.amount || 0)}</td>
                      <td>{Math.round((tx.risk_score || 0) * 100)}%</td>
                      <td className="truncate">{tx.content || '--'}</td>
                      <td>{formatTime(tx.createdAt)}</td>
                    </tr>
                  ))}
                  {!transactions.length && (
                    <tr><td colSpan="7" className="empty-cell">Chưa có dữ liệu giao dịch</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="side-stack">
            <section className="panel event-panel">
              <div className="panel-title compact">
                <div>
                  <h2>Enforcement log</h2>
                  <p>Tài khoản/thẻ/giao dịch bị xử lý</p>
                </div>
                <AlertTriangle size={21} />
              </div>
              <div className="event-list">
                {events.map((event) => (
                  <article key={event._id} className="event-item">
                    <div>
                      <EventBadge type={event.event_type} />
                      <span className="event-time">{formatTime(event.createdAt)}</span>
                    </div>
                    <strong>{event.account_id || 'UNKNOWN'} / {event.card_id || 'NO-CARD'}</strong>
                    <p>{event.reason}</p>
                  </article>
                ))}
                {!events.length && <p className="muted">Chưa có enforcement log.</p>}
              </div>
            </section>

            <section className="panel terminal-panel">
              <div className="panel-title compact">
                <div>
                  <h2>Ops stream</h2>
                  <p>Log cục bộ của dashboard</p>
                </div>
                <FileClock size={21} />
              </div>
              <div className="terminal">
                {opsLog.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
