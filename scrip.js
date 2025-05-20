const API_KEY = KSD0IANMYDI8VBTK; // API key for Alpha Vantage
let chart;

async function loadStock(symbol) {
  document.getElementById("stock-title").textContent = `Loading ${symbol}...`;
  const priceURL = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
  const historyURL = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${API_KEY}`;

  const [priceRes, historyRes] = await Promise.all([
    fetch(priceURL),
    fetch(historyURL)
  ]);

  const priceData = await priceRes.json();
  const historyData = await historyRes.json();

  const price = priceData["Global Quote"]["05. price"];
  document.getElementById("stock-title").textContent = `${symbol}`;
  document.getElementById("stock-price").textContent = `Current Price: $${parseFloat(price).toFixed(2)}`;

  const timeSeries = historyData["Time Series (Daily)"];
  const dates = Object.keys(timeSeries).reverse().slice(-30);
  const values = dates.map(date => parseFloat(timeSeries[date]["4. close"]));

  if (chart) chart.destroy();
  const ctx = document.getElementById("stockChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [{
        label: `${symbol} Stock Price`,
        data: values,
        borderColor: "#00ccff",
        backgroundColor: "rgba(0, 204, 255, 0.2)",
        tension: 0.3,
      }],
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: "#f0f0f0"
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#ccc" }
        },
        y: {
          ticks: { color: "#ccc" }
        }
      }
    }
  });
}
