// ── Helpers ──────────────────────────────────────────────────────────────────
function row(label, value, highlight) {
  return `<div class="res-row">
    <span class="res-label">${label}</span>
    <span class="res-value${highlight ? ' highlight' : ''}">${value}</span>
  </div>`;
}

// ── Tab switching ─────────────────────────────────────────────────────────────
function show(id) {
  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
  document.getElementById(id).style.display = 'block';
  setTimeout(() => document.getElementById(id).classList.add('active'), 20);
  document.getElementById('tab-' + id).classList.add('active');
}

// ── Проценти: Надценка / Отстъпка ────────────────────────────────────────────
function calcPercent() {
  const base = parseFloat(document.getElementById('percentBase').value) || 0;
  const pct  = parseFloat(document.getElementById('percentValue').value) || 0;
  const type = document.getElementById('percentType').value;
  if (!base && !pct) { document.getElementById('percentOutput').innerHTML = ''; return; }
  const result = type === 'plus' ? base * (1 + pct / 100) : base * (1 - pct / 100);
  const diff   = Math.abs(result - base);
  document.getElementById('percentOutput').innerHTML =
    row('Нова сума', `${result.toFixed(2)} лв`, true) +
    row('Разлика',  `${diff.toFixed(2)} лв`);
}

// ── Проценти: Марж калкулатор ─────────────────────────────────────────────────
function calcMargin() {
  const cost   = parseFloat(document.getElementById('marginCost').value) || 0;
  const margin = parseFloat(document.getElementById('marginPct').value)  || 0;
  const out    = document.getElementById('marginOutput');
  if (!cost || !margin) { out.innerHTML = ''; return; }
  if (margin >= 100) {
    out.innerHTML = '<div class="warn">⚠️ Маржът не може да е 100% или повече</div>';
    return;
  }
  const sell   = cost / (1 - margin / 100);
  const profit = sell - cost;
  const markup = (profit / cost * 100);
  out.innerHTML =
    row('Продажна цена', `${sell.toFixed(2)} лв`, true) +
    row('Печалба',       `${profit.toFixed(2)} лв`) +
    row('Надценка',      `${markup.toFixed(1)}%`);
}

// ── ДДС ───────────────────────────────────────────────────────────────────────
function calcVatGross() {
  const v   = parseFloat(document.getElementById('vatGross').value) || 0;
  const net = (v / 1.2).toFixed(2);
  const vat = (v - net).toFixed(2);
  document.getElementById('vatGrossRes').innerHTML =
    row('Нетна сума', `${net} лв`) +
    row('ДДС 20%',    `${vat} лв`, true);
}

function calcVatNet() {
  const n     = parseFloat(document.getElementById('vatNet').value) || 0;
  const gross = (n * 1.2).toFixed(2);
  const vat   = (n * 0.2).toFixed(2);
  document.getElementById('vatNetRes').innerHTML =
    row('С ДДС',   `${gross} лв`, true) +
    row('ДДС 20%', `${vat} лв`);
}

function calcVatOnly() {
  const d     = parseFloat(document.getElementById('vatOnly').value) || 0;
  const net   = (d / 0.2).toFixed(2);
  const gross = (net * 1.2).toFixed(2);
  document.getElementById('vatOnlyRes').innerHTML =
    row('Нетна сума',   `${net} лв`) +
    row('Общо с ДДС',   `${gross} лв`, true);
}

// ── ДДС: Пакетно изчисление ───────────────────────────────────────────────────
function calcVatBatch() {
  const rows    = document.querySelectorAll('.batch-row');
  const isGross = document.getElementById('batchMode').value === 'gross';
  let totalNet = 0, totalVat = 0, totalGross = 0, count = 0;

  rows.forEach(r => {
    const price = parseFloat(r.querySelector('.batch-price').value) || 0;
    if (!price) return;
    const net = isGross ? price / 1.2 : price;
    totalNet   += net;
    totalVat   += net * 0.2;
    totalGross += net * 1.2;
    count++;
  });

  const out = document.getElementById('vatBatchResult');
  if (!count) { out.innerHTML = ''; return; }
  out.innerHTML =
    row('Артикули',    `${count}`) +
    row('Общо без ДДС', `${totalNet.toFixed(2)} лв`) +
    row('Общо ДДС',    `${totalVat.toFixed(2)} лв`) +
    row('Общо с ДДС',  `${totalGross.toFixed(2)} лв`, true);
}

function addBatchRow() {
  const container = document.getElementById('vatBatchItems');
  const r = document.createElement('div');
  r.className = 'batch-row';
  r.innerHTML =
    `<input type="text" placeholder="Артикул" class="batch-name">` +
    `<input type="number" placeholder="Цена" class="batch-price" oninput="calcVatBatch()">` +
    `<button class="btn-remove" onclick="this.parentElement.remove();calcVatBatch();" aria-label="Премахни">✕</button>`;
  container.appendChild(r);
}

// ── Валута ────────────────────────────────────────────────────────────────────
const eurToBgn = 1.95583; // фиксиран курс (currency board)
let eurToUsd = 1.08;      // ще се обнови от API

async function fetchRates() {
  const statusEl  = document.getElementById('rateStatus');
  const displayEl = document.getElementById('rateDisplay');
  try {
    const res  = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD');
    if (!res.ok) throw new Error();
    const data = await res.json();
    eurToUsd = data.rates.USD;
    const now = new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' });
    statusEl.textContent = '🟢 Актуален';
    statusEl.className   = 'rate-badge live';
    displayEl.innerHTML  =
      `1 EUR = <b>${eurToBgn.toFixed(5)} BGN</b> &nbsp;|&nbsp; 1 EUR = <b>${eurToUsd.toFixed(4)} USD</b>` +
      `<small>USD обновен: ${now}</small>`;
  } catch {
    statusEl.textContent = '🔴 USD не е актуален';
    statusEl.className   = 'rate-badge fixed';
    displayEl.innerHTML  =
      `1 EUR = <b>${eurToBgn.toFixed(5)} BGN</b> &nbsp;|&nbsp; 1 EUR = <b>${eurToUsd.toFixed(4)} USD</b>` +
      `<small>Няма връзка — използва се последен известен курс</small>`;
  }
}

function clearCurrency() {
  ['bgn', 'eur', 'usd'].forEach(id => document.getElementById(id).value = '');
}

function convCur(src) {
  const val = parseFloat(document.getElementById(src).value) || 0;
  let eurVal;
  if      (src === 'eur') eurVal = val;
  else if (src === 'bgn') eurVal = val / eurToBgn;
  else                    eurVal = val / eurToUsd;

  if (src !== 'bgn') document.getElementById('bgn').value = (eurVal * eurToBgn).toFixed(2);
  if (src !== 'eur') document.getElementById('eur').value = eurVal.toFixed(2);
  if (src !== 'usd') document.getElementById('usd').value = (eurVal * eurToUsd).toFixed(2);
}

// ── Изчисти ───────────────────────────────────────────────────────────────────
function clearPercent() {
  ['percentBase', 'percentValue', 'marginCost', 'marginPct'].forEach(id =>
    document.getElementById(id).value = '');
  ['percentOutput', 'marginOutput'].forEach(id =>
    document.getElementById(id).innerHTML = '');
}

function clearVat() {
  ['vatGross', 'vatNet', 'vatOnly'].forEach(id =>
    document.getElementById(id).value = '');
  ['vatGrossRes', 'vatNetRes', 'vatOnlyRes', 'vatBatchResult'].forEach(id =>
    document.getElementById(id).innerHTML = '');
  document.querySelectorAll('.batch-price, .batch-name').forEach(el => el.value = '');
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  fetchRates();
});
