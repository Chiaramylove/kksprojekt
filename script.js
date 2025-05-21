const TWELVE_DATA_KEY = "83579784923942f584e172a8955697a8";
const FINNHUB_KEY = "d0mve4hr01qmjqmjnp3gd0mve4hr01qmjqmjnp40";
let charts = {};
let useEuro = false;

async function loadStock(symbol) {
  if (document.getElementById(`chart-${symbol}`)) return; // prevent duplicates

  try {
    const data = await fetchFromTwelveData(symbol) || await fetchFromFinnhub(symbol);
    if (!data) throw new Error("Keine Daten gefunden");
    displayStock(symbol, data.price, data.dates, data.values);
  } catch (e) {
    alert(`Fehler beim Laden von ${symbol}: ${e.message}`);
  }
}

async function fetchFromTwelveData(symbol) {
  try {
    const priceUrl = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${TWELVE_DATA_KEY}`;
    const seriesUrl = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${TWELVE_DATA_KEY}`;
    const [priceRes, seriesRes] = await Promise.all([fetch(priceUrl), fetch(seriesUrl)]);
    const priceData = await priceRes.json();
    const seriesData = await seriesRes.json();

    if (!priceData.price || !seriesData.values) return null;
    return {
      price: parseFloat(priceData.price),
      dates: seriesData.values.map(e => e.datetime).reverse(),
      values: seriesData.values.map(e => parseFloat(e.close)).reverse()
    };
  } catch {
    return null;
  }
}

async function fetchFromFinnhub(symbol) {
  try {
    const priceUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`;
    const seriesUrl = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&count=30&token=${FINNHUB_KEY}`;
    const [priceRes, seriesRes] = await Promise.all([fetch(priceUrl), fetch(seriesUrl)]);
    const priceData = await priceRes.json();
    const seriesData = await seriesRes.json();

    if (!priceData.c || seriesData.s !== "ok") return null;

    return {
      price: priceData.c,
      dates: seriesData.t.map(t => new Date(t * 1000).toISOString().split("T")[0]),
      values: seriesData.c
    };
  } catch {
    return null;
  }
}

function displayStock(symbol, price, dates, values) {
  const main = document.getElementById("mainContent");
  const container = document.createElement("div");
  container.className = "chart-container";
  container.id = `chart-${symbol}`;

  const conversionRate = 0.92;
  const adjustedPrice = useEuro ? price * conversionRate : price;
  const currencySymbol = useEuro ? "€" : "$";

  const title = document.createElement("h2");
  title.textContent = `${symbol} – Aktueller Preis: ${currencySymbol}${adjustedPrice.toFixed(2)}`;

  const canvas = document.createElement("canvas");
  container.appendChild(title);
  container.appendChild(canvas);
  main.appendChild(container);

  const ctx = canvas.getContext("2d");
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [{
        label: `${symbol} Verlauf`,
        data: values.map(v => useEuro ? v * conversionRate : v),
        borderColor: "#00ccff",
        backgroundColor: "rgba(0, 204, 255, 0.2)",
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: getComputedStyle(document.body).color } }
      },
      scales: {
        x: { ticks: { color: getComputedStyle(document.body).color } },
        y: { ticks: { color: getComputedStyle(document.body).color } }
      }
    }
  });

  charts[symbol] = chart;
}

function refreshAllCharts() {
  for (let symbol in charts) {
    const container = document.getElementById(`chart-${symbol}`);
    if (container) container.remove();
  }
  charts = {};
  document.querySelector(".note")?.remove();
  loadStock('AAPL'); // Optional default reload
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("menuBtn").addEventListener("click", () => {
    document.getElementById("sideMenu").classList.toggle("open");
  });

  document.getElementById("themeToggle").addEventListener("change", (e) => {
    document.body.classList.toggle("light-mode", e.target.checked);
    Object.values(charts).forEach(chart => chart.update());
  });

  document.getElementById("currencyToggle").addEventListener("change", (e) => {
    useEuro = e.target.checked;
    refreshAllCharts();
  });
});

