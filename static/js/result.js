const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
let query = params.q;
document.title = `${query} | Keyword Usage`;

document.querySelector("span.query").innerText = `"${query}"`;
const ctx = document.querySelector("#graph").getContext("2d");

d3.csv('/static/results/charting.csv').then(function(datapoints){
    const storage = [];
    var min = 1;
    var max = 1;
    var minDate = new Date();
    var maxDate = new Date();

    for (i = 0; i < datapoints.length; i++) {
        if (datapoints[i].date_count != "") {
            if (datapoints[i].date_count > max) {
                max = datapoints[i].date_count;
            }
            if (datapoints[i].date_count < min) {
                min = datapoints[i].date_count;
            }
        }
    }
    const ratio = (100-1)/(max-min);

    for (i = 0; i < datapoints.length; i++) {
        var text = [];
        if (datapoints[i].date_count != "") {
            x = datapoints[i].time_count;
            y = datapoints[i].time_count;
            r = datapoints[i].date_count;
            var xDate = new Date(x);
            if (xDate < minDate) {
                minDate = new Date(xDate.getTime());
            }
            if (xDate > maxDate) {
                maxDate = new Date(xDate.getTime());
            }
            r = Math.floor(1 + ratio*(r-min));

            for (a = 0; a < datapoints.length; a++) {
                var dateOnly = new Date(datapoints[a].time);
                dateOnly = dateOnly.toISOString().substring(0,10);
                if (y == dateOnly) {
                    text.push(datapoints[a].text);
                }
            }

            var json = {x: x, y: y, r:r, text: text};
            storage.push(json);
        }
    }
    maxDate.setDate(maxDate.getDate() + 5);
    minDate.setDate(minDate.getDate() - 1);

    //setup
    const data = {
        datasets: [{
            label: 'No. of Chatter (Scaled)',
            data: storage
        }]
    }

    //config
    const config = {
        type: 'bubble',
        data,
        options: {
            onClick: clickHandler,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'DD MMM YYYY',
                    },
                    max: maxDate,
                    min: minDate
                },
                y: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'DD MMM YYYY',
                    },
                    max: maxDate,
                    min: minDate
                }
            }
        }
    }

    //config
    var chart = new Chart(ctx, config);

    function clickHandler(evt) {
        const points = chart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
    
        if (points.length) {
            const firstPoint = points[0];
            const label = chart.data.labels[firstPoint.index];
            const value = chart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
            console.log(value)
        }
    }
    
});
