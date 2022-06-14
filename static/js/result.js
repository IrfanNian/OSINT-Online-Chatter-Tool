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
            var tDate = datapoints[i].time_count
            var xDate = new Date(tDate);
            if (datapoints[i].date_count > max) {
                max = datapoints[i].date_count;
            }
            if (datapoints[i].date_count < min) {
                min = datapoints[i].date_count;
            }
            if (xDate < minDate) {
                minDate = new Date(xDate.getTime());
            }
            if (xDate > maxDate) {
                maxDate = new Date(xDate.getTime());
            }
        }
    }
    const ratio = (100-1)/(max-min);

    const diffTime = Math.abs(maxDate - minDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    for (i = 0; i < datapoints.length; i++) {
        var text = [];
        var user = [];
        if (datapoints[i].date_count != "") {
            var x = datapoints[i].time_count;
            var r = datapoints[i].date_count;
            var y = r/diffDays;
            r = Math.floor(1 + ratio*(r-min));

            for (a = 0; a < datapoints.length; a++) {
                var dateOnly = new Date(datapoints[a].time);
                dateOnly = dateOnly.toISOString().substring(0,10);
                if (x == dateOnly) {
                    text.push(datapoints[a].text);
                    user.push(datapoints[a].user);
                }
            }
            var json = {x: x, y: y, r: r, text: text, user: user};
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
                    title: {
                        display: true,
                        text: 'Date',
                    },
                    time: {
                        unit: 'day',
                        tooltipFormat: 'DD MMM YYYY',
                    },
                    max: maxDate,
                    min: minDate
                },
                y: {
                    title: {
                        display: true,
                        text: 'Avg Chatter / Days',
                    },
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
            console.log(value.text)
            console.log(value.user)
            var ar = [value.user, value.text], table = document.querySelector('table tbody');
            table.innerHTML = '';
            var r = ar[0].map(function(col, i) {
                return ar.map(function(row) {
                  return row[i];
                });
              });

            //Add data to table
            r.forEach(function(e) {
                table.innerHTML += '<tr><td>' + e[0] + '</td><td>' + e[1] + '</td></tr>'
            })
        }
    }
});

function myFunction() {
  var input, filter, table, tr, td, i, t;
  input = document.getElementById("searchBar");
  filter = input.value.toUpperCase();
  table = document.getElementById("tablebubz");
  tr = table.querySelectorAll("tbody tr:not(.header)");
  for (i = 0; i < tr.length; i++) {
    var filtered = false;
    var tds = tr[i].getElementsByTagName("td");
    for(t=0; t<tds.length; t++) {
        var td = tds[t];
        if (td) {
          if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
            filtered = true;
          }
        }
    }
    if(filtered===true) {
        tr[i].style.display = '';
    }
    else {
        tr[i].style.display = 'none';
    }
  }
}