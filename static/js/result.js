const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
let query = params.q;
document.title = `${query} | Keyword Usage`;

document.querySelector("span.query").innerText = `"${query}"`;
const ctx = document.querySelector("#graph").getContext("2d");

let recordsPerPage = 50;
let numPage = 1;
let currentArray = [];
let currentPage = 1;

d3.csv('/static/results/charting.csv').then(function(datapoints){
    const storage = [];
    var minDate = new Date();
    var maxDate = new Date();

    var max = Math.max.apply(Math, datapoints.map(function(o) {return o.date_count}))
    var min = Math.min.apply(Math, datapoints.map(function(o) {return o.date_count}))

    for (i = 0; i < datapoints.length; i++) {
        if (datapoints[i].date_count != "") {
            var tDate = datapoints[i].time_count
            var xDate = new Date(tDate);
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
            var ar = [value.user, value.text], table = document.querySelector('table tbody');
            function getNumPages(array) {
                return Math.ceil(array.length/recordsPerPage);
            }

            function prevPage() {
                if (currentPage > 1) {
                    currentPage--;
                    changePage(currentPage, currentArray);
                }
            }

            function nextPage() {
                if (currentPage < numPage) {
                    currentPage++;
                    changePage(currentPage, currentArray);
                }
            }

            function changePage(page, array) {
                numPage = getNumPages(array);
                const btn_prev = document.getElementById('btn-prev');
                const btn_next = document.getElementById('btn-next');
                let page_span = document.getElementById('page');
                const btn_page_nav = document.getElementById('pagination_nav');
                btn_page_nav.style.display = 'inline-block';
                page_span.style.display = 'inline-block';

                if (page < 1) {
                    page = 1;
                }

                if (page > numPage) {
                    page = numPage;
                }

                table.innerHTML = '';
                page_span.innerHTML = '';

                if (recordsPerPage > array.length) {
                    recordsPerPage = array.length;
                }
                else {
                    recordsPerPage = 50;
                }

                for (let i = (page - 1) * recordsPerPage; i < (page * recordsPerPage) && array.length; i++) {
                    try {
                        table.innerHTML += '<tr><td>' + array[i][0] + '</td><td>' + array[i][1] + '</td></tr>'
                    }
                    catch {
                        numPage = 1;
                    }
                }
                page_span.innerHTML += page + "/" + numPage;
                btn_prev.style.display = (page === 1) ? 'none' : 'inline-block';
                btn_next.style.display = (page === numPage) ? 'none' : 'inline-block';
                let tbl = document.getElementById("tablebubz");
                if (tbl.rows.length == 1) {
                    btn_page_nav.style.display = 'none';
                }
            }

            function searchArray(array) {
                input = document.getElementById("searchBar");
                filter = input.value.toUpperCase();
                let filtered = array.filter(text => {
                    return typeof text[1] == 'string' && text[1].toUpperCase().indexOf(filter) > -1;
                })
                currentArray = filtered;
                currentPage = 1;
                changePage(currentPage, filtered)
            }

            var r = ar[0].map(function(col, i) {
                return ar.map(function(row) {
                  return row[i];
                });
              });

            document.getElementById('searchBar').addEventListener('keyup', (e) => {
                    e.preventDefault();
                    searchArray(r);
            });

            document.getElementById('btn-next').addEventListener('click', (e) => {
                    e.preventDefault();
                    nextPage();
            });

            document.getElementById('btn-prev').addEventListener('click', (e) => {
                    e.preventDefault();
                    prevPage();
            });

            currentArray = r;
            currentPage = 1;
            changePage(currentPage, r);
        }
    }
});

//function myFunction() {
//    var input, filter, table, tr, td, i, t;
//    input = document.getElementById("searchBar");
//    filter = input.value.toUpperCase();
//    table = document.getElementById("tablebubz");
//    tr = table.querySelectorAll("tbody tr:not(.header)");
//    for (i = 0; i < tr.length; i++) {
//        var filtered = false;
//        var tds = tr[i].getElementsByTagName("td");
//        for(t=0; t<tds.length; t++) {
//            var td = tds[t];
//            if (td) {
//                if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
//                    filtered = true;
//                }
//            }
//        }
//        if(filtered===true) {
//            tr[i].style.display = '';
//        }
//        else {
//            tr[i].style.display = 'none';
//        }
//    }
//}