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

function calcPercent() {
  const base = parseFloat(document.getElementById('percentBase').value) || 0;
  const pct = parseFloat(document.getElementById('percentValue').value) || 0;
  const type = document.getElementById('percentType').value;
  const result = type === 'plus' ? base * (1 + pct / 100) : base * (1 - pct / 100);
  const diff = Math.abs(result - base);
  document.getElementById('percentOutput').innerHTML =
    `Нова сума: ${result.toFixed(2)} лв<br>Разлика: ${diff.toFixed(2)} лв`;
}

function calcVatGross() {
  const v = parseFloat(document.getElementById('vatGross').value) || 0;
  const net20 = (v / 1.2).toFixed(2);
  const vat20 = (v - net20).toFixed(2);
  document.getElementById('vatGrossRes').innerHTML =
    `Нетна сума: ${net20} лв<br>ДДС (20%): ${vat20} лв`;
}

function calcVatNet() {
  const n = parseFloat(document.getElementById('vatNet').value) || 0;
  const gross20 = (n * 1.2).toFixed(2);
  const vat20 = (n * 0.2).toFixed(2);
  document.getElementById('vatNetRes').innerHTML =
    `С ДДС: ${gross20} лв<br>ДДС (20%): ${vat20} лв`;
}

function calcVatOnly() {
  const d = parseFloat(document.getElementById('vatOnly').value) || 0;
  const net20 = (d / 0.2).toFixed(2);
  const gross20 = (net20 * 1.2).toFixed(2);
  document.getElementById('vatOnlyRes').innerHTML =
    `Нетна сума: ${net20} лв<br>Общо с ДДС: ${gross20} лв`;
}

function convCur(src) {
  const rate = 1.95583;
  const b = document.getElementById('bgn');
  const e = document.getElementById('eur');
  const val = parseFloat(src === 'bgn' ? b.value : e.value) || 0;
  if (src === 'bgn') e.value = (val / rate).toFixed(2);
  else b.value = (val * rate).toFixed(2);
}

function calculateResto() {
  const price = parseFloat(document.getElementById("price").value);
  const paid = parseFloat(document.getElementById("paid").value);
  const priceCurr = document.getElementById("price-currency").value;
  const paidCurr = document.getElementById("paid-currency").value;
  const resultCurr = document.getElementById("result-currency").value;
  const output = document.getElementById("resto-result");

  if (isNaN(price) || isNaN(paid)) {
    output.textContent = "Моля, въведете валидни стойности.";
    return;
  }

  const rate = 1.95583;
  const toEUR = val => (val / rate);
  const toBGN = val => (val * rate);

  const priceEUR = priceCurr === "EUR" ? price : toEUR(price);
  const paidEUR = paidCurr === "EUR" ? paid : toEUR(paid);
  const restoEUR = paidEUR - priceEUR;

  if (restoEUR < 0) {
    output.textContent = "Платената сума е недостатъчна.";
    return;
  }

  const finalResto = resultCurr === "EUR" ? restoEUR : toBGN(restoEUR);
  const symbol = resultCurr === "EUR" ? "€" : "лв.";

  output.textContent = `Ресто: ${finalResto.toFixed(2)} ${symbol}`;
}
