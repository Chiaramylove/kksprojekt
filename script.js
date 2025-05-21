const TWELVE_DATA_KEY = "83579784923942f584e172a8955697a8";
const FINNHUB_KEY = "d0mve4hr01qmjqmjnp3gd0mve4hr01qmjqmjnp40";
let chart;

window.loadStock = async function (symbol) {
  document.getElementById("stock-title").textContent = `Lade ${symbol}...`;
  document.getElementById("stock-price").textContent = "";

  try {
    const data = await fetchFromTwelveData(symbol);
    if (!data) throw new Error("TwelveData failed, trying Finnhub...");

    updateDisplay(symbol, data.price, data.dates, data.values);
  } catch (err) {
    console.warn(err.message);
    try {
      const data = await fetchFromFinnhub(symbol);
      if (!data) throw new Error("Finnhub failed too.");

      updateDisplay(symbol, data.price, data.dates, data.values);
    } catch (finalError) {
      console.error(finalError);
      document.getElementById("stock-title").textContent = `Fehler beim Laden von ${symbol}`;
    }
  }
};

async function fetchFromTwelveData(symbol) {
  const priceUrl = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${TWELVE_DATA_KEY}`;
  const seriesUrl = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${TWELVE_DATA_KEY}`;

  const [priceRes, seriesRes] = await Promise.all([fetch(priceUrl), fetch(seriesUrl)]);
  const priceData = await priceRes.json();
  const seriesData = await seriesRes.json();

  if (!priceData.price || !seriesData.values) return null;

  const dates = seriesData.values.map(e => e.datetime).reverse();
  const values = seriesData.values.map(e => parseFloat(e.close)).reverse();

  return {
    price: parseFloat(priceData.price),
    dates,
    values
  };
}

async function fetchFromFinnhub(symbol) {
  const priceUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`;
  const seriesUrl = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&count=30&token=${FINNHUB_KEY}`;

  const [priceRes, seriesRes] = await Promise.all([fetch(priceUrl), fetch(seriesUrl)]);
  const priceData = await priceRes.json();
  const seriesData = await seriesRes.json();

  if (!priceData.c || !seriesData.c || seriesData.s !== "ok") return null;

  const dates = seriesData.t.map(t => new Date(t * 1000).toISOString().split("T")[0]);
  const values = seriesData.c;

  return {
    price: parseFloat(priceData.c),
    dates,
    values
  };
}

function updateDisplay(symbol, price, dates, values) {
  document.getElementById("stock-title").textContent = symbol;
  document.getElementById("stock-price").textContent = `Aktueller Preis: $${price.toFixed(2)}`;

  if (chart) chart.destroy();
  const ctx = document.getElementById("stockChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [{
        label: `${symbol} Kursverlauf`,
        data: values,
        borderColor: "#00ccff",
        backgroundColor: "rgba(0, 204, 255, 0.2)",
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { labels: { color: "#f0f0f0" } },
        tooltip: { mode: "index", intersect: false }
      },
      scales: {
        x: { ticks: { color: "#ccc" } },
        y: { ticks: { color: "#ccc" } }
      }
    }
  });
}
