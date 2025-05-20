const API_KEY = "KSD0IANMYDI8VBTK"; // API von Alpha Vantage

const stocks = [
  { id: 'AAPL', name: 'Apple', color: '#4a89dc' },
  { id: 'MSFT', name: 'Microsoft', color: '#6cb2eb' },
  { id: 'TSLA', name: 'Tesla', color: '#e3342f' },
  { id: 'AMZN', name: 'Amazon', color: '#ffed4a' },
  { id: 'GOOGL', name: 'Alphabet', color: '#38c172' },
  { id: 'NVDA', name: 'Nvidia', color: '#9561e2' },
  { id: 'META', name: 'Meta', color: '#f66d9b' }
];

async function loadStocks() {
  const container = document.getElementById('stockCards');
  for (const stock of stocks) {
    const cardId = `c_${stock.id}`;
    const chartId = `chart_${stock.id}`;
    container.innerHTML += `
      <div class="card" onclick="toggleChart('${chartId}')">
        <h3>${stock.name} (${stock.id})</h3>
        <div class="price" id="price_${stock.id}">Loading...</div>
        <div class="chart" id="${chartId}"><canvas></canvas></div>
      </div>
    `;

    try {
      const res = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stock.id}&apikey=${API_KEY}`);
      const data = await res.json();
      const series = data["Time Series (Daily)"];
      const dates = Object.keys(series).slice(0, 7).reverse();
      const prices = dates.map(date => parseFloat(series[date]["4. close"]));
      const percentChange = (((prices[6] - prices[0]) / prices[0]) * 100).toFixed(2);
      const sign = percentChange >= 0 ? '+' : '';
      const className = percentChange >= 0 ? 'up' : 'down';
      document.getElementById("price_" + stock.id).innerHTML = `\$${prices[6]} <span class="\${className}">\${sign}\${percentChange}%</span>`;

      const ctx = document.getElementById(chartId).querySelector('canvas').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [{
            data: prices,
            borderColor: stock.color,
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { display: false }, y: { display: false } }
        }
      });
    } catch (e) {
      document.getElementById("price_" + stock.id).innerText = "Fehler beim Laden.";
    }
  }
}

function toggleChart(id) {
  document.getElementById(id).classList.toggle('active');
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

document.addEventListener('DOMContentLoaded', loadStocks);
