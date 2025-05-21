const TWELVE_DATA_KEY = "83579784923942f584e172a8955697a8";
let chart;
let currentCurrency = "$";

window.loadStock = async function (symbol) {
  document.getElementById("stock-title").textContent = `Lade ${symbol}...`;
  document.getElementById("stock-price").textContent = "";

  const priceUrl = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${TWELVE_DATA_KEY}`;
  const seriesUrl = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=60&apikey=${TWELVE_DATA_KEY}`;

  try {
    const [priceRes, seriesRes] = await Promise.all([fetch(priceUrl), fetch(seriesUrl)]);
    const priceData = await priceRes.json();
    const seriesData = await seriesRes.json();

    if (!priceData.price || !seriesData.values) throw new Error("Keine Daten");

    const price = parseFloat(priceData.price);
    const dates = seriesData.values.map(v => v.datetime).reverse();
    const values = seriesData.values.map(v => parseFloat(v.close)).reverse();

    updateChart(symbol, price, dates, values);
  } catch (e) {
    document.getElementById("stock-title").textContent = "Fehler beim Laden.";
    console.error(e);
  }
};

function updateChart(symbol, price, dates, values) {
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
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim(),
        backgroundColor: "rgba(0,0,0,0)",
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: { color: getComputedStyle(document.body).color }
        },
        y: {
          ticks: { color: getComputedStyle(document.body).color }
        }
      },
      plugins: {
        legend: { labels: { color: getComputedStyle(document.body).color } },
        zoom: {
          pan: { enabled: true, mode: 'x' },
          zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }
        }
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const sideMenu = document.getElementById("sideMenu");
  const themeToggle = document.getElementById("themeToggle");
  const currencyToggle = document.getElementById("currencyToggle");
  const colorCircles = document.querySelectorAll(".color-circle");

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

  colorCircles.forEach(circle => {
    circle.addEventListener("click", () => {
      const color = circle.dataset.color;
      document.documentElement.style.setProperty("--theme-color", color);
      if (chart) chart.update();
    });
  });

  // Start mit Apple
  loadStock("AAPL");
});

