const TWELVE_DATA_KEY = "83579784923942f584e172a8955697a8";
let chart;
let currentCurrency = "$";

window.loadStock = async function (symbol) {
  document.getElementById("stock-title").textContent = `Lade ${symbol}...`;
  document.getElementById("stock-price").textContent = "";

  try {
    const data = await fetchFromTwelveData(symbol);
    if (!data) throw new Error("Keine Daten gefunden.");
    updateDisplay(symbol, data.price, data.dates, data.values);
  } catch (err) {
    console.error(err);
    document.getElementById("stock-title").textContent = `Fehler beim Laden von ${symbol}`;
  }
};

async function fetchFromTwelveData(symbol) {
  const priceUrl = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${TWELVE_DATA_KEY}`;
  const seriesUrl = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=90&apikey=${TWELVE_DATA_KEY}`;
  const [priceRes, seriesRes] = await Promise.all([fetch(priceUrl), fetch(seriesUrl)]);
  const priceData = await priceRes.json();
  const seriesData = await seriesRes.json();

  if (!priceData.price || !seriesData.values) return null;

  const dates = seriesData.values.map(e => e.datetime).reverse();
  const values = seriesData.values.map(e => parseFloat(e.close)).reverse();

  return { price: parseFloat(priceData.price), dates, values };
}

function updateDisplay(symbol, price, dates, values) {
  document.getElementById("stock-title").textContent = symbol;
  document.getElementById("stock-price").textContent = `Aktueller Preis: ${currentCurrency}${price.toFixed(2)}`;

  if (chart) chart.destroy();
  const ctx = document.getElementById("stockChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [{
        label: `${symbol} Kursverlauf`,
        data: values,
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color'),
        backgroundColor: "rgba(0,0,0,0.1)",
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          labels: {
            color: getComputedStyle(document.body).color
          }
        },
        tooltip: {
          mode: "index",
          intersect: false
        },
        zoom: {
          pan: { enabled: true, mode: 'x' },
          zoom: { pinch: { enabled: true }, wheel: { enabled: true }, mode: 'x' }
        }
      },
      scales: {
        x: { ticks: { color: getComputedStyle(document.body).color } },
        y: { ticks: { color: getComputedStyle(document.body).color } }
      }
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const sideMenu = document.getElementById("sideMenu");
  const themeToggle = document.getElementById("themeToggle");
  const currencyToggle = document.getElementById("currencyToggle");

  menuBtn.addEventListener("click", () => {
    sideMenu.classList.toggle("open");
  });

  themeToggle.addEventListener("change", () => {
    document.body.classList.toggle("light-mode", themeToggle.checked);
    if (chart) chart.update();
  });

  currencyToggle.addEventListener("change", () => {
    currentCurrency = currencyToggle.checked ? "€" : "$";
    loadStock("AAPL");
  });
});

window.setThemeColor = function (color) {
  const colorMap = {
    cyan: "#00ccff",
    purple: "#9c27b0",
    red: "#f44336",
    green: "#4caf50"
  };
  document.documentElement.style.setProperty('--accent-color', colorMap[color]);
  if (chart) chart.update();
};
