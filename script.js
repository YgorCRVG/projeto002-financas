let transacoes = JSON.parse(localStorage.getItem("transacoes")) || [];

const lista = document.getElementById("lista-transacoes");
const form = document.getElementById("form-transacao");
const saldoEl = document.getElementById("saldo");
const receitasEl = document.getElementById("receitas");
const despesasEl = document.getElementById("despesas");
const economiaEl = document.getElementById("economia");
const topGastoMessage = document.getElementById("topGastoMessage");
const btnAdd = document.getElementById("btn-add");
const btnExport = document.getElementById("btn-exportar");
const modal = document.getElementById("modal");
const btnCancelar = document.getElementById("btn-cancelar");

btnAdd.addEventListener("click", () => modal.style.display = 'flex');
btnCancelar.addEventListener("click", () => modal.style.display = 'none');
window.addEventListener("click", e => e.target === modal && (modal.style.display = 'none'));
btnExport.addEventListener("click", exportarCSV);

form.addEventListener("submit", e => {
  e.preventDefault();
  const nova = {
    descricao: document.getElementById("descricao").value,
    valor: parseFloat(document.getElementById("valor").value),
    data: document.getElementById("data").value,
    categoria: document.getElementById("categoria").value,
    tipo: document.querySelector("input[name='tipo']:checked").value
  };
  transacoes.push(nova);
  localStorage.setItem("transacoes", JSON.stringify(transacoes));
  form.reset();
  modal.style.display = 'none';
  atualizarDashboard();
});

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function atualizarTotais() {
  let receita = 0, despesa = 0;
  transacoes.forEach(t => t.tipo === "receita" ? receita += t.valor : despesa += t.valor);
  const saldo = receita - despesa;

  const economia = saldo > 0 ? saldo * 0.1 : 0;

  saldoEl.textContent = formatarMoeda(saldo);
  receitasEl.textContent = formatarMoeda(receita);
  despesasEl.textContent = formatarMoeda(despesa);
  economiaEl.textContent = formatarMoeda(economia);
}

function atualizarLista(listaFiltrada = transacoes) {
  lista.innerHTML = "";
  listaFiltrada.slice().reverse().forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${t.descricao} (${t.categoria})</span>
      <span style="color: ${t.tipo === "receita" ? "#00ff88" : "#ff4d4d"};">${formatarMoeda(t.valor)}</span>
    `;
    lista.appendChild(li);
  });
}

function mostrarTopGasto() {
  const categorias = {};
  transacoes.forEach(t => {
    if (t.tipo === "despesa") categorias[t.categoria] = (categorias[t.categoria] || 0) + t.valor;
  });
  const top = Object.entries(categorias).sort((a,b) => b[1]-a[1])[0];
  topGastoMessage.innerHTML = '';
  if (top) {
    const p = document.createElement("p");
    p.textContent = `Você gasta mais em: ${top[0]} (${formatarMoeda(top[1])})`;
    p.style.color = "#facc15";
    p.style.marginTop = "10px";
    topGastoMessage.appendChild(p);
  }
}

function atualizarEmoji() {
  const carinha = document.querySelector(".card.saldo h3");
  const saldo = transacoes.reduce((acc, t) => t.tipo === 'receita' ? acc + t.valor : acc - t.valor, 0);
  carinha.textContent = saldo < 0 ? "Saldo 😢" : saldo < 100 ? "Saldo 😐" : "Saldo 😄";
}

function exportarCSV() {
  const csv = transacoes.map(t => `${t.descricao},${t.valor},${t.data},${t.categoria},${t.tipo}`).join("\n");
  const blob = new Blob(["Descrição,Valor,Data,Categoria,Tipo\n" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "transacoes.csv";
  link.click();
}

let myChart, graficoCategorias;
function atualizarGraficos() {
  const receita = transacoes.filter(t => t.tipo === "receita").reduce((acc,t) => acc + t.valor,0);
  const despesa = transacoes.filter(t => t.tipo === "despesa").reduce((acc,t) => acc + t.valor,0);

  myChart.data.datasets[0].data = [receita, despesa];
  myChart.update();

  const categorias = {};
  transacoes.forEach(t => {
    if (t.tipo === "despesa") categorias[t.categoria] = (categorias[t.categoria] || 0) + t.valor;
  });
  graficoCategorias.data.labels = Object.keys(categorias);
  graficoCategorias.data.datasets[0].data = Object.values(categorias);
  graficoCategorias.update();
}

function iniciarCharts() {
  const ctx1 = document.getElementById("myChart").getContext("2d");
  myChart = new Chart(ctx1, {
    type: 'doughnut',
    data: {
      labels: ['Receitas', 'Despesas'],
      datasets: [{ data: [0,0], backgroundColor: ['#22c55e','#ef4444'], borderWidth: 1 }]
    },
    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels:{color:'#fff'} } } }
  });

  const ctx2 = document.getElementById("graficoCategorias").getContext("2d");
  graficoCategorias = new Chart(ctx2, {
    type: 'doughnut',
    data: { labels: [], datasets: [{ label:'Despesas', data: [], backgroundColor:['#FF6384','#36A2EB','#FFCE56','#8AFFC1','#FF9F40','#A28EFF'] }] },
    options: { responsive: true, maintainAspectRatio: true, plugins: { legend:{position:'bottom', labels:{color:'#fff'}} } }
  });
}

function mostrarSecao(secao) {
  document.querySelector('.resumo').style.display = secao==='resumo' ? 'grid' : 'none';
  document.querySelector('.graficos').style.display = secao==='graficos' ? 'flex' : 'none';
  document.querySelector('.transacoes').style.display = secao==='transacoes' ? 'block' : 'none';
}

function atualizarDashboard() {
  atualizarTotais();
  atualizarLista();
  atualizarEmoji();
  mostrarTopGasto();
  atualizarGraficos();
}

iniciarCharts();
mostrarSecao('resumo');
atualizarDashboard();