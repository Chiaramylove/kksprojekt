let chart;

const dates = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return date.toISOString().split("T")[0];
});

const values = dates.map(() => Math.random() * 100 + 100);

const ctx = document.getElementById("stockChart").getContext("2d");
chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: dates,
    datasets: [{
      label: "Beispiel Aktie",
      data: values,
      borderColor: "#00ccff",
      backgroundColor: "rgba(0, 204, 255, 0.2)",
      tension: 0.4,
      fill: true
    }]
  },
  options: {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false
    },
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
        pan: { enabled: true, mode: "x" },
        zoom: { wheel: { enabled: true }, mode: "x" }
      }
    },
    scales: {
      x: {
        ticks: {
          color: getComputedStyle(document.body).color
        }
      },
      y: {
        ticks: {
          color: getComputedStyle(document.body).color
        }
      }
    }
  }
});

document.getElementById("themeToggle").addEventListener("change", (e) => {
  document.body.classList.toggle("light-mode", e.target.checked);
  chart.options.plugins.legend.labels.color = getComputedStyle(document.body).color;
  chart.options.scales.x.ticks.color = getComputedStyle(document.body).color;
  chart.options.scales.y.ticks.color = getComputedStyle(document.body).color;
  chart.update();
});
