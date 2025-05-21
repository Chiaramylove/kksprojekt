const TWELVE_DATA_KEY = "83579784923942f584e172a8955697a8";
let chart;
let useEuro = false;

async function loadStock(symbol) {
  document.getElementById("stock-title").textContent = `Lade ${symbol}...`;
  document.getElementById("stock-price").textContent = "";

  try {
    const data = await fetchFromTwelveData(symbol);
    if (!data) throw new Error("Fehler beim Abrufen der Daten von TwelveData.");
    updateDisplay(symbol, data.price, data.dates, data.values);
  } catch (err) {
    console.error(err);
    document.getElementById("stock-title").textContent = `Fehler beim Laden von ${symbol}`;
  }
}

async function fetchFromTwelveData(symbol) {
  const priceUrl = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${TWELVE_DATA_KEY}`;
  const seriesUrl = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${TWELVE_DATA_KEY}`;
  const [priceRes, seriesRes] = await Promise.all([fetch(priceUrl), fetch(seriesUrl)]);
  const priceData = await priceRes.json();
  const seriesData = await seriesRes.json();

  if (!priceData.price || !seriesData.values) return null;

  const dates = seriesData.values.map(e => e.datetime).reverse();
  const values = seriesData.values.map(e => parseFloat(e.close)).reverse();

  return { price: parseFloat(priceData.price), dates, values };
}

function updateDisplay(symbol, price, dates, values) {
  const formattedPrice = useEuro
    ? `Aktueller Preis: €${(price * 0.92).toFixed(2)}`
    : `Aktueller Preis: $${price.toFixed(2)}`;

  document.getElementById("stock-title").textContent = symbol;
  document.getElementById("stock-price").textContent = formattedPrice;

  if (chart) chart.destroy();
  const ctx = document.getElementById("stockChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [{
        label: `${symbol} Kursverlauf`,
        data: values,
        borderColor: getComputedStyle(document.documentElement).getPropertyValue("--theme-color"),
        backgroundColor: "rgba(0, 204, 255, 0.2)",
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { labels: { color: getComputedStyle(document.body).color } },
        tooltip: { mode: "index", intersect: false }
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
  const colorCircles = document.querySelectorAll(".color-circle");

  menuBtn.addEventListener("click", () => {
    sideMenu.classList.toggle("open");
  });

  themeToggle.addEventListener("change", () => {
    document.body.classList.toggle("light-mode", themeToggle.checked);
    if (chart) chart.update();
  });

  currencyToggle.addEventListener("change", () => {
    useEuro = currencyToggle.checked;
    loadStock("AAPL");
  });

  colorCircles.forEach(circle => {
    circle.addEventListener("click", () => {
      const newColor = circle.getAttribute("data-color");
      document.documentElement.style.setProperty("--theme-color", newColor);
      if (chart) chart.update();
    });
  });

  // Standardfarbe setzen
  document.documentElement.style.setProperty("--theme-color", "#00ccff");
});
