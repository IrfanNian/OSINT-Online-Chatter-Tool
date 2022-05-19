const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
let query = params.q;
document.title = `${query} | Keyword Usage in pastebin`;

document.querySelector("span.query").innerText = `"${query}"`;

const ctx = document.querySelector("#graph").getContext("2d");

// Gradient Fill
let gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, "rgba(58,123,213,1)");
gradient.addColorStop(1, "rgba(0,210,255,0.3)");

let delayed;

const labels = ["2012", "2013", "2019", "2020", "2021"];

const data = {
    labels,
    datasets: [
        {
            data: [450, 326, 500, 175, 410],
            label: "Sales Figures",
            tension: 0.4,
        },
    ],
};

const config = {
    type: "line",
    data,
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltips: {
                enabled: false,
            },
        },
        radius: 0,
        hitRadius: 30,
        hoverRadius: 0,
        borderColor: "grey",

        resposive: true,
        animation: {
            onComplete: () => {
                delayed: true;
            },
            delay: (context) => {
                let delay = 0;
                if (
                    context.type === "data" &&
                    context.mode === "default" &&
                    !delayed
                ) {
                    delay =
                        context.dataIndex * 300 + context.datasetIndex * 100;
                }
                return delay;
            },
        },
        scales: {
            x: {
                grid: { borderColor: "black", color: "black" },
                ticks: { color: "black" },
            },
            y: {
                grid: { borderColor: "black", color: "black" }, //pls check index.css
                ticks: {
                    count: 6,
                    color: "black",
                    callback: function (value) {
                        return "$" + value + "m";
                    },
                },
            },
        },
    },
};

const myChart = new Chart(ctx, config);
