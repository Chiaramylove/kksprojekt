const API_KEY = "83579784923942f584e172a8955697a8";
let chart;

window.loadStock = async function (symbol) {
  document.getElementById("stock-title").textContent = `Lade ${symbol}...`;
  document.getElementById("stock-price").textContent = "";

  const urlPrice = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${API_KEY}`;
  const urlTimeSeries = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${API_KEY}`;

  try {
    const [priceRes, timeSeriesRes] = await Promise.all([
      fetch(urlPrice),
      fetch(urlTimeSeries)
    ]);

    const priceData = await priceRes.json();
    const timeSeriesData = await timeSeriesRes.json();

    if (!priceData.price || !timeSeriesData.values) {
      document.getElementById("stock-title").textContent = `Fehler beim Laden von ${symbol}`;
      return;
    }

    document.getElementById("stock-title").textContent = symbol;
    document.getElementById("stock-price").textContent = `Aktueller Preis: $${parseFloat(priceData.price).toFixed(2)}`;

    const dates = timeSeriesData.values.map(entry => entry.datetime).reverse();
    const values = timeSeriesData.values.map(entry => parseFloat(entry.close)).reverse();

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
  } catch (err) {
    console.error("Fehler beim Abrufen der Daten:", err);
    document.getElementById("stock-title").textContent = `Fehler beim Laden von ${symbol}`;
  }
};
