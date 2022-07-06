const form = document.forms[0];
const chartHolderHTML = document.querySelector("#graph").getContext("2d");
let drawBubble = document.getElementById("bubble_chart");
let drawCountry = document.getElementById("country_chart");
let drawLine = document.getElementById("line_chart");
let drawScatter = document.getElementById("scatter_chart");
let chartSummary = document.getElementById("chart_sum");
let recordsPerPage = 50;
let numPage = 1;
let currentArray = [];
drawCloud();
drawBubbleChart();

drawBubble.addEventListener("click", function () {
    let chartStatus = Chart.getChart("graph");
    let tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    drawBubble.className += " active";
    if (chartStatus != undefined) {
      chartStatus.destroy();
    }
    drawBubbleChart();
});
drawCountry.addEventListener("click", function () {
    let chartStatus = Chart.getChart("graph");
    let tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    drawCountry.className += " active";
    if (chartStatus != undefined) {
      chartStatus.destroy();
    }
    drawCountryChart();
});
drawLine.addEventListener("click", function () {
    let chartStatus = Chart.getChart("graph");
    let tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    drawLine.className += " active";
    if (chartStatus != undefined) {
      chartStatus.destroy();
    }
    drawLineChart();
});
drawScatter.addEventListener("click", function () {
    let chartStatus = Chart.getChart("graph");
    let tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    drawScatter.className += " active";
    if (chartStatus != undefined) {
      chartStatus.destroy();
    }
    drawScatterChart();
});

function drawCloud() {
    d3.csv('/static/results/charting.csv').then(function (datapoints) {
        let TWCount = 0;
        let RDCount = 0;
        let PBCount = 0;
        let TWSeries = [];
        let RDSeries = [];
        let PBSeries = [];
        let minDate = new Date();
        let maxDate = new Date();
        for (i = 0; i < datapoints.length; i++) {
            if (datapoints[i].date_count != "") {
                let tDate = datapoints[i].time_count
                let xDate = new Date(tDate);
                if (xDate < minDate) {
                    minDate = new Date(xDate.getTime());
                }
                if (xDate > maxDate) {
                    maxDate = new Date(xDate.getTime());
                }
            }
            if (datapoints[i].date != "") {
                if (datapoints[i].platform == "twitter") {
                    TWCount = TWCount + parseInt(datapoints[i].count);
                    TWSeries.push({ x: datapoints[i].date, y: parseInt(datapoints[i].count) });
                }
                else if (datapoints[i].platform == "reddit") {
                    RDCount = RDCount + parseInt(datapoints[i].count);
                    RDSeries.push({ x: datapoints[i].date, y: parseInt(datapoints[i].count) });
                }
                else if (datapoints[i].platform == "pastebin") {
                    PBCount = PBCount + parseInt(datapoints[i].count);
                    PBSeries.push({ x: datapoints[i].date, y: parseInt(datapoints[i].count) });
                }
            }
        }
        //wordcloud
        function wordcloud(myWords) {
            let margin = { top: 10, right: 10, bottom: 10, left: 10 }
            //calculate size of canvas
            width = 520 - margin.left - margin.right;
            height = 350 - margin.top - margin.bottom;
            //positioning
            let svg = d3.select("#word-cloud").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            let layout = d3.layout.cloud()
                .size([width, height])
                .words(myWords.map(function (d) { return { text: d.word, size: d.size }; }))
                .padding(5)
                .rotate(function () { return ~~(Math.random() * 2) * 90; })
                .fontSize(function (d) { return d.size / 2; })
                .on("end", draw);

            layout.start();

            //draw words in svg canvas
            function draw(words) {
                svg
                    .append("g")
                    .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                    .selectAll("text")
                    .data(words)
                    .enter().append("text")
                    .style("font-size", function (d) { return d.size; })
                    .style("fill", "#bd7dab")
                    .attr("text-anchor", "middle")
                    .style("font-family", "K2D")
                    .attr("transform", function (d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .text(function (d) { return d.text; });
            }
        }

        //usernamecloud
        function usernamecloud(myWords) {
            let margin = { top: 10, right: 10, bottom: 10, left: 10 }
            //calculate size of canvas
            width = 520 - margin.left - margin.right;
            height = 350 - margin.top - margin.bottom;

            //positioning
            let svg = d3.select("#username-cloud").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            let layout = d3.layout.cloud()
                .size([width, height])
                .words(myWords.map(function (d) { return { text: d.user, size: d.size }; }))
                .padding(5)
                .rotate(function () { return ~~(Math.random() * 2) * 90; })
                .fontSize(function (d) { return d.size / 2; })
                .on("end", draw);

            layout.start();

            //draw words in svg canvas
            function draw(words) {
                svg
                    .append("g")
                    .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                    .selectAll("text")
                    .data(words)
                    .enter().append("text")
                    .style("font-size", function (d) { return d.size; })
                    .style("fill", "#5cacc2")
                    .attr("text-anchor", "middle")
                    .style("font-family", "K2D")
                    .attr("transform", function (d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .text(function (d) { return d.text; });
            }
        }
        wordcloud(datapoints);
        usernamecloud(datapoints);
        document.getElementById("CountTW").textContent = TWCount
        document.getElementById("CountRD").textContent = RDCount
        document.getElementById("CountPB").textContent = PBCount
    })
}

function drawLineChart() {
    d3.csv('/static/results/charting.csv').then(function (datapoints) {
        let minDate = new Date();
        let maxDate = new Date();
        let TWCount = 0;
        let RDCount = 0;
        let PBCount = 0;
        let TWSeries = [];
        let RDSeries = [];
        let PBSeries = [];
        for (i = 0; i < datapoints.length; i++) {
            if (datapoints[i].date_count != "") {
                let tDate = datapoints[i].time_count
                let xDate = new Date(tDate);
                if (xDate < minDate) {
                    minDate = new Date(xDate.getTime());
                }
                if (xDate > maxDate) {
                    maxDate = new Date(xDate.getTime());
                }
            }
            if (datapoints[i].date != "") {
                if (datapoints[i].platform == "twitter") {
                    TWCount = TWCount + parseInt(datapoints[i].count);
                    TWSeries.push({ x: datapoints[i].date, y: parseInt(datapoints[i].count) });
                }
                else if (datapoints[i].platform == "reddit") {
                    RDCount = RDCount + parseInt(datapoints[i].count);
                    RDSeries.push({ x: datapoints[i].date, y: parseInt(datapoints[i].count) });
                }
                else if (datapoints[i].platform == "pastebin") {
                    PBCount = PBCount + parseInt(datapoints[i].count);
                    PBSeries.push({ x: datapoints[i].date, y: parseInt(datapoints[i].count) });
                }
            }
        }
        //multiple line chart
        const MultilineChartConfig = {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Twitter',
                        data: TWSeries,
                        borderColor: "rgba(0, 172, 238, 1)",
                        backgroundColor: "rgba(0, 172, 238, 0.5)"
                    },
                    {
                        label: 'Reddit',
                        data: RDSeries,
                        borderColor: "rgba(255, 67, 0, 1)",
                        backgroundColor: "rgba(255, 67, 0, 0.5)"

                    },
                    {
                        label: 'Pastebin',
                        data: PBSeries,
                        borderColor: "rgba(0, 0, 0, 1)",
                        backgroundColor: "rgba(0, 0, 0, 0.5)"
                    }
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        title: {
                            display: true,
                            text: 'Date',
                        },
                        time: {
                            unit: 'day',
                            tooltipFormat: 'dd MMM yyyy',
                        },
                        max: maxDate,
                        min: minDate
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Posts / Days',
                        },
                    }
                }
            }
        }
        let MultilineChart = new Chart(chartHolderHTML, MultilineChartConfig);
        chart_sum.textContent = "";
        let chart_sum_paragraph = "Twitter has " + TWCount + " total amount of Tweets.\r\n"
        chart_sum_paragraph += "Reddit has " + RDCount + " total amount of Posts.\r\n"
        chart_sum_paragraph += "PasteBin has " + PBCount + " total amount of Pastes.\r\n"
        chart_sum.textContent = chart_sum_paragraph;
    })
}

function drawBubbleChart() {
    d3.csv('/static/results/charting.csv').then(function (datapoints) {
        // bubble chart
        const bubbleStorage = [];
        var minDate = new Date();
        var maxDate = new Date();
        var max = Math.max.apply(Math, datapoints.map(function (o) { return o.date_count }))
        var min = Math.min.apply(Math, datapoints.map(function (o) { return o.date_count }))
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
        const ratio = (100 - 1) / (max - min);
        const diffTime = Math.abs(maxDate - minDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        for (let i = 0; i < datapoints.length; i++) {
            var bubbleText = [];
            var bubbleUser = [];
            if (datapoints[i].date_count != "") {
                var x = datapoints[i].time_count;
                var r = datapoints[i].date_count;
                var y = r / diffDays;
                r = Math.floor(1 + ratio * (r - min));

                for (let a = 0; a < datapoints.length; a++) {
                    if (datapoints[a].time != "") {
                        var dateOnly = new Date(datapoints[a].time);
                        var tzoffset = (new Date()).getTimezoneOffset() * 60000;
                        var localISOTime = (new Date(dateOnly - tzoffset)).toISOString().slice(0, -1);
                        dateOnly = localISOTime.split('T', 1)[0];
                        if (x == dateOnly) {
                            bubbleText.push(datapoints[a].text);
                            bubbleUser.push(datapoints[a].user);
                        }
                    }
                }
                var json = { x: x, y: y, r: r, text: bubbleText, user: bubbleUser };
                bubbleStorage.push(json);
            }
        }
        maxDate.setDate(maxDate.getDate() + 3);
        minDate.setDate(minDate.getDate() - 1);
        //config
        const bubbleChartConfig = {
            type: 'bubble',
            data: {
                datasets: [{
                    label: 'No. of Chatter (Scaled)',
                    data: bubbleStorage
                }],
            },
            options: {
                onClick: clickBubbleHandler,
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        title: {
                            display: true,
                            text: 'Date',
                        },
                        time: {
                            unit: 'day',
                            tooltipFormat: 'dd MMM yyyy',
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
        let bubbleChart = new Chart(chartHolderHTML, bubbleChartConfig);
        function clickBubbleHandler(evt) {
            const points = bubbleChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
            let currentPage = 1;

            if (points.length) {
                const firstPoint = points[0];
                const label = bubbleChart.data.labels[firstPoint.index];
                const value = bubbleChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
                var ar = [value.user, value.text], table = document.querySelector('table tbody');
                function getNumPages(array) {
                    return Math.ceil(array.length / recordsPerPage);
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
                    page_span.style.display = 'inline-block';

                    if (page < 1) {
                        page = 1;
                    }

                    if (page > numPage) {
                        page = numPage;
                    }

                    table.textContent = '';
                    page_span.textContent = '';

                    if (recordsPerPage > array.length) {
                        recordsPerPage = array.length;
                    }
                    else {
                        recordsPerPage = 50;
                    }

                    for (let i = (page - 1) * recordsPerPage; i < (page * recordsPerPage) && array.length; i++) {
                        try {
                            row = table.insertRow(0);
                            var cell1 = row.insertCell(0);
                            var cell2 = row.insertCell(1);
                            cell1.textContent = array[i][0];
                            cell2.textContent = array[i][1];
                        }
                        catch {
                            numPage = page;
                        }
                    }
                    page_span.textContent += page + "/" + numPage;
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

                var r = ar[0].map(function (col, i) {
                    return ar.map(function (row) {
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
        min_r = bubbleStorage.reduce(function(prev, curr) {
            return prev.r < curr.r ? prev : curr;
        });
        max_r = bubbleStorage.reduce(function(prev, curr) {
            return prev.r > curr.r ? prev : curr;
        });
        chart_sum.textContent = "";
        let chart_sum_paragraph = "The date with the most amount of chatter on average is on: " + max_r.x + "(" + max_r.text.length + ").\r\n"
        chart_sum_paragraph += "The date with the least amount of chatter on average is on: " + min_r.x + "(" + min_r.text.length + ").\r\n"
        chart_sum.textContent = chart_sum_paragraph;
    })
}

function drawCountryChart() {
    d3.csv('/static/results/charting.csv').then(function (datapoints) {
        // country bar chart
        const countryStorage = [];
        for (let i = 0; i < datapoints.length; i++) {
            let countryText = [];
            let countryUser = [];
            if (datapoints[i].country_count != "") {
                let x = datapoints[i].location_count;
                let y = datapoints[i].country_count;
                for (let a = 0; a < datapoints.length; a++) {
                    if (x == datapoints[a].location) {
                        countryText.push(datapoints[a].text);
                        countryUser.push(datapoints[a].user);
                    }
                }
                let json = { x: x, y: y, text: countryText, user: countryUser };
                countryStorage.push(json);
            }
        }
        //config
        const countryChartConfig = {
            type: 'bar',
            data: {
                datasets: [{
                    label: 'No. of Tweets Per Country',
                    data: countryStorage
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                onClick: clickCountryBarHandler,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Country',
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Total No. of Tweets',
                        },
                        ticks: {
                            beginAtZero: true,
                        },
                        min: -5
                    }
                }
            }
        }
        //config
        let countryChart = new Chart(chartHolderHTML, countryChartConfig);
        function clickCountryBarHandler(evt) {
            const points = countryChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
            let currentPage = 1;

            if (points.length) {
                const firstPoint = points[0];
                const label = countryChart.data.labels[firstPoint.index];
                const value = countryChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
                let ar = [value.user, value.text], table = document.querySelector('table tbody');
                function getNumPages(array) {
                    return Math.ceil(array.length / recordsPerPage);
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
                    page_span.style.display = 'inline-block';

                    if (page < 1) {
                        page = 1;
                    }

                    if (page > numPage) {
                        page = numPage;
                    }

                    table.textContent = '';
                    page_span.textContent = '';

                    if (recordsPerPage > array.length) {
                        recordsPerPage = array.length;
                    }
                    else {
                        recordsPerPage = 50;
                    }

                    for (let i = (page - 1) * recordsPerPage; i < (page * recordsPerPage) && array.length; i++) {
                        try {
                            row = table.insertRow(0);
                            var cell1 = row.insertCell(0);
                            var cell2 = row.insertCell(1);
                            cell1.textContent = array[i][0];
                            cell2.textContent = array[i][1];
                        }
                        catch {
                            numPage = page;
                        }
                    }
                    page_span.textContent += page + "/" + numPage;
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

                var r = ar[0].map(function (col, i) {
                    return ar.map(function (row) {
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
        min_y = countryStorage.reduce(function(prev, curr) {
            return prev.y < curr.y ? prev : curr;
        });
        max_y = countryStorage.reduce(function(prev, curr) {
            return prev.y > curr.y ? prev : curr;
        });
        chart_sum.textContent = "";
        let chart_sum_paragraph = "The country with the most amount of tweets: " + max_y.x + "(" + max_y.text.length + ").\r\n"
        chart_sum_paragraph += "The country with the least amount of tweets: " + min_y.x + "(" + min_y.text.length + ").\r\n"
        chart_sum.textContent = chart_sum_paragraph;
    })
}

function drawScatterChart() {
    d3.csv('/static/results/charting.csv').then(function (datapoints) {
        //scatter graph
        const scatterStorage = [];
        for (let i = 0; i < datapoints.length; i++) {
            if (datapoints[i].time != "") {
                let scatterText = [];
                let scatterUser = [];
                let xt = datapoints[i].day;
                let x = new Date(xt);
                x = x.toISOString().substring(0, 10);
                let yt = datapoints[i].time;
                let y = new Date(yt);
                y = y.toISOString().substring(11, 13);
                for (let a = 0; a < datapoints.length; a++) {
                    if (datapoints[a].time != "") {
                        let dateOnly = new Date(datapoints[a].time);
                        let tzoffset = (new Date()).getTimezoneOffset() * 60000;
                        let localISOTime = (new Date(dateOnly - tzoffset)).toISOString().slice(0, -1);
                        dateOnly = localISOTime.split('T', 1)[0];

                        let timeOnly = new Date(datapoints[a].time);
                        timeOnly = timeOnly.toISOString().substring(11, 13);

                        if (x == dateOnly && y == timeOnly) {
                            scatterText.push(datapoints[a].text);
                            scatterUser.push(datapoints[a].user);
                        }
                    }
                }
                let json = { x: x, y: y, text: scatterText, user: scatterUser };
                scatterStorage.push(json);
            }
        }
        //config
        const scatterChartConfig = {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Chatter Throughout the hours and days',
                    data: scatterStorage
                }],
            },
            options: {
                onClick: clickScatterHandler,
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        title: {
                            display: true,
                            text: 'Date',
                        },
                        time: {
                            unit: 'day',
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Hour (24H Format)',
                        },
                        min: 0,
                        max: 24,
                    }
                }
            }
        }
        //config
        let scatterChart = new Chart(chartHolderHTML, scatterChartConfig);
        function clickScatterHandler(evt) {
            const points = scatterChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
            let currentPage = 1;

            if (points.length) {
                const firstPoint = points[0];
                const label = scatterChart.data.labels[firstPoint.index];
                const value = scatterChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
                var ar = [value.user, value.text], table = document.querySelector('table tbody');
                function getNumPages(array) {
                    return Math.ceil(array.length / recordsPerPage);
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
                    page_span.style.display = 'inline-block';

                    if (page < 1) {
                        page = 1;
                    }

                    if (page > numPage) {
                        page = numPage;
                    }

                    table.textContent = '';
                    page_span.textContent = '';

                    if (recordsPerPage > array.length) {
                        recordsPerPage = array.length;
                    }
                    else {
                        recordsPerPage = 50;
                    }

                    for (let i = (page - 1) * recordsPerPage; i < (page * recordsPerPage) && array.length; i++) {
                        try {
                            row = table.insertRow(0);
                            var cell1 = row.insertCell(0);
                            var cell2 = row.insertCell(1);
                            cell1.textContent = array[i][0];
                            cell2.textContent = array[i][1];
                        }
                        catch {
                            numPage = page;
                        }
                    }
                    page_span.textContent += page + "/" + numPage;
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

                var r = ar[0].map(function (col, i) {
                    return ar.map(function (row) {
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
        min_text = scatterStorage.reduce(function(prev, curr) {
            return prev.text.length < curr.text.length ? prev : curr;
        });
        max_text = scatterStorage.reduce(function(prev, curr) {
            return prev.text.length > curr.text.length ? prev : curr;
        });
        chart_sum.textContent = "";
        let chart_sum_paragraph = "The most amount of chatter on average is on: " + max_text.x + " " + max_text.y + "00hrs" + "(" + max_text.text.length + ").\r\n"
        chart_sum_paragraph += "The least amount of chatter on average is on: " + max_text.x + " " + min_text.y + "00hrs" + "(" + min_text.text.length + ").\r\n"
        chart_sum.textContent = chart_sum_paragraph;
    })
}