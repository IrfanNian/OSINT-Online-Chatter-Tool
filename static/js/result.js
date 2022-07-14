const form = document.forms[0];
const chartHolderHTML = document.querySelector("#graph").getContext("2d");
let drawBubble = document.getElementById("bubble_chart");
let drawCountry = document.getElementById("country_chart");
let drawLine = document.getElementById("line_chart");
let drawScatter = document.getElementById("scatter_chart");
let chartSummary = document.getElementById("chart_sum");
let drawDoughnut = document.getElementById("doughnut_chart");
let drawFollowers = document.getElementById("followers_chart");
let recordsPerPage = 50;
let numPage = 1;
let currentArray = [];
let topPoster = [];
let topFollowers = [];
drawCloud();
drawBubbleChart();
const zeroDayWords = ["0day", "zero-day"];
const attackWords = [
    "attack",
    "attacked",
    "APT",
    "weaponized",
    "weaponised",
    "malware",
    "campaign",
];

function removeActive() {
    let tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
}

function destroyChart() {
    let chartStatus = Chart.getChart("graph");
    if (chartStatus != undefined) {
        chartStatus.destroy();
    }
}

drawBubble.addEventListener("click", function () {
    removeActive();
    drawBubble.className += " active";
    destroyChart();
    drawBubbleChart();
});
drawCountry.addEventListener("click", function () {
    removeActive();
    drawCountry.className += " active";
    destroyChart();
    drawCountryChart();
});
drawLine.addEventListener("click", function () {
    removeActive();
    drawLine.className += " active";
    destroyChart();
    drawLineChart();
});
drawScatter.addEventListener("click", function () {
    removeActive();
    drawScatter.className += " active";
    destroyChart();
    drawScatterChart();
});
drawDoughnut.addEventListener("click", function () {
    removeActive();
    drawDoughnut.className += " active";
    destroyChart();
    drawDoughnutChart();
});
drawFollowers.addEventListener("click", function () {
    removeActive();
    drawFollowers.className += " active";
    destroyChart();
    drawFollowersChart();
});

let table = document.querySelector("table tbody");
table.textContent = "";
row = table.insertRow(0);
var cell1 = row.insertCell(0);
var cell2 = row.insertCell(1);
cell1.textContent = "NOTE:";
cell2.textContent = "Click on a datapoint to display its contents!";

function drawCloud() {
    d3.csv("/static/results/charting.csv").then(function (datapoints) {
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
                let tDate = datapoints[i].time_count;
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
                    TWSeries.push({
                        x: datapoints[i].date,
                        y: parseInt(datapoints[i].count),
                    });
                } else if (datapoints[i].platform == "reddit") {
                    RDCount = RDCount + parseInt(datapoints[i].count);
                    RDSeries.push({
                        x: datapoints[i].date,
                        y: parseInt(datapoints[i].count),
                    });
                } else if (datapoints[i].platform == "pastebin") {
                    PBCount = PBCount + parseInt(datapoints[i].count);
                    PBSeries.push({
                        x: datapoints[i].date,
                        y: parseInt(datapoints[i].count),
                    });
                }
            }
        }
        //wordcloud
        function wordcloud(myWords) {
            let margin = { top: 10, right: 10, bottom: 10, left: 10 };
            //calculate size of canvas
            width = 520 - margin.left - margin.right;
            height = 350 - margin.top - margin.bottom;
            //positioning
            let svg = d3
                .select("#word-cloud")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr(
                    "transform",
                    "translate(" + margin.left + "," + margin.top + ")"
                );

            let layout = d3.layout
                .cloud()
                .size([width, height])
                .words(
                    myWords.map(function (d) {
                        return { text: d.word, size: d.size };
                    })
                )
                .padding(5)
                .rotate(function () {
                    return ~~(Math.random() * 2) * 90;
                })
                .fontSize(function (d) {
                    return d.size / 2;
                })
                .on("end", draw);

            layout.start();

            //draw words in svg canvas
            function draw(words) {
                svg.append("g")
                    .attr(
                        "transform",
                        "translate(" +
                            layout.size()[0] / 2 +
                            "," +
                            layout.size()[1] / 2 +
                            ")"
                    )
                    .selectAll("text")
                    .data(words)
                    .enter()
                    .append("text")
                    .style("font-size", function (d) {
                        return d.size;
                    })
                    .style("fill", "#bd7dab")
                    .attr("text-anchor", "middle")
                    .style("font-family", "K2D")
                    .attr("transform", function (d) {
                        return (
                            "translate(" +
                            [d.x, d.y] +
                            ")rotate(" +
                            d.rotate +
                            ")"
                        );
                    })
                    .text(function (d) {
                        return d.text;
                    });
            }
        }

        //usernamecloud
        function usernamecloud(myWords) {
            let margin = { top: 10, right: 10, bottom: 10, left: 10 };
            //calculate size of canvas
            width = 520 - margin.left - margin.right;
            height = 350 - margin.top - margin.bottom;

            //positioning
            let svg = d3
                .select("#username-cloud")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr(
                    "transform",
                    "translate(" + margin.left + "," + margin.top + ")"
                );

            let layout = d3.layout
                .cloud()
                .size([width, height])
                .words(
                    myWords.map(function (d) {
                        return { text: d.user, size: d.size };
                    })
                )
                .padding(5)
                .rotate(function () {
                    return ~~(Math.random() * 2) * 90;
                })
                .fontSize(function (d) {
                    return d.size / 2;
                })
                .on("end", draw);

            layout.start();

            //draw words in svg canvas
            function draw(words) {
                svg.append("g")
                    .attr(
                        "transform",
                        "translate(" +
                            layout.size()[0] / 2 +
                            "," +
                            layout.size()[1] / 2 +
                            ")"
                    )
                    .selectAll("text")
                    .data(words)
                    .enter()
                    .append("text")
                    .style("font-size", function (d) {
                        return d.size;
                    })
                    .style("fill", "#5cacc2")
                    .attr("text-anchor", "middle")
                    .style("font-family", "K2D")
                    .attr("transform", function (d) {
                        return (
                            "translate(" +
                            [d.x, d.y] +
                            ")rotate(" +
                            d.rotate +
                            ")"
                        );
                    })
                    .text(function (d) {
                        return d.text;
                    });
            }
        }
        wordcloud(datapoints);
        usernamecloud(datapoints);
        document.getElementById("CountTW").textContent = TWCount;
        document.getElementById("CountRD").textContent = RDCount;
        document.getElementById("CountPB").textContent = PBCount;
    });
}

function getMax(jsonList, property) {
    var max = 0;
    var maxItem = null;
    for (var i = 0; i < jsonList.length; i++) {
        var item = jsonList[i];
        if (item[property] > max) {
            max = item[property];
            maxItem = item;
        }
    }

    return maxItem;
}

function drawLineChart() {
    d3.csv("/static/results/charting.csv").then(function (datapoints) {
        // line chart
        const TWStorage = [];
        const RDStorage = [];
        const PBStorage = [];

        let TWCount = 0;
        let RDCount = 0;
        let PBCount = 0;
        let TWSeries = [];
        let RDSeries = [];
        let PBSeries = [];

        var minDate = new Date();
        var maxDate = new Date();

        for (let i = 0; i < datapoints.length; i++) {
            if (datapoints[i].date_count != "") {
                var tDate = datapoints[i].time_count;
                var xDate = new Date(tDate);
                if (xDate < minDate) {
                    minDate = new Date(xDate.getTime());
                }
                if (xDate > maxDate) {
                    maxDate = new Date(xDate.getTime());
                }
            }
            if (datapoints[i].date != "") {
                if (datapoints[i].platform == "twitter") {
                    var texts = [];
                    var users = [];
                    var x = datapoints[i].time_count;
                    var y = 0;
                    for (let a = 0; a < datapoints.length; a++) {
                        if (datapoints[a].time != "") {
                            var dateOnly = new Date(datapoints[a].time);
                            var tzoffset =
                                new Date().getTimezoneOffset() * 60000;
                            var localISOTime = new Date(dateOnly - tzoffset)
                                .toISOString()
                                .slice(0, -1);
                            dateOnly = localISOTime.split("T", 1)[0];
                            if (x == dateOnly) {
                                y++;
                                texts.push(datapoints[a].text);
                                users.push(datapoints[a].user);
                            }
                        }
                    }
                    var json = { x: x, y: y, text: texts, user: users };

                    TWStorage.push(json);

                    TWCount = TWCount + parseInt(datapoints[i].count);
                    TWSeries.push({
                        x: datapoints[i].date,
                        y: parseInt(datapoints[i].count),
                    });
                } else if (datapoints[i].platform == "reddit") {
                    var texts = [];
                    var users = [];
                    var x = datapoints[i].time_count;
                    var y = 0;
                    for (let a = 0; a < datapoints.length; a++) {
                        if (datapoints[a].time != "") {
                            var dateOnly = new Date(datapoints[a].time);
                            var tzoffset =
                                new Date().getTimezoneOffset() * 60000;
                            var localISOTime = new Date(dateOnly - tzoffset)
                                .toISOString()
                                .slice(0, -1);
                            dateOnly = localISOTime.split("T", 1)[0];
                            if (x == dateOnly) {
                                y++;
                                texts.push(datapoints[a].text);
                                users.push(datapoints[a].user);
                            }
                        }
                    }
                    var json = { x: x, y: y, text: texts, user: users };

                    RDStorage.push(json);
                    RDCount = RDCount + parseInt(datapoints[i].count);
                    RDSeries.push({
                        x: datapoints[i].date,
                        y: parseInt(datapoints[i].count),
                    });
                } else if (datapoints[i].platform == "pastebin") {
                    var texts = [];
                    var users = [];
                    var x = datapoints[i].time_count;
                    var y = 0;
                    for (let a = 0; a < datapoints.length; a++) {
                        if (datapoints[a].time != "") {
                            var dateOnly = new Date(datapoints[a].time);
                            var tzoffset =
                                new Date().getTimezoneOffset() * 60000;
                            var localISOTime = new Date(dateOnly - tzoffset)
                                .toISOString()
                                .slice(0, -1);
                            dateOnly = localISOTime.split("T", 1)[0];
                            if (x == dateOnly) {
                                y++;
                                texts.push(datapoints[a].text);
                                users.push(datapoints[a].user);
                            }
                        }
                    }
                    var json = { x: x, y: y, text: texts, user: users };

                    PBStorage.push(json);
                    PBCount = PBCount + parseInt(datapoints[i].count);
                    PBSeries.push({
                        x: datapoints[i].date,
                        y: parseInt(datapoints[i].count),
                    });
                }
            }
        }

        var TWMaxEvent = getMax(TWStorage, "y");
        var RDMaxEvent = getMax(RDStorage, "y");
        var PBMaxEvent = getMax(PBStorage, "y");

        maxDate.setDate(maxDate.getDate() + 3);
        minDate.setDate(minDate.getDate() - 1);
        //config
        const MultilineChartConfig = {
            type: "line",
            data: {
                datasets: [
                    {
                        label: "Twitter",
                        data: TWStorage,
                        borderColor: "rgba(0, 172, 238, 1)",
                        backgroundColor: "rgba(0, 172, 238, 0.5)",
                    },
                    {
                        label: "Reddit",
                        data: RDStorage,
                        borderColor: "rgba(255, 67, 0, 1)",
                        backgroundColor: "rgba(255, 67, 0, 0.5)",
                    },
                    {
                        label: "Pastebin",
                        data: PBStorage,
                        borderColor: "rgba(0, 0, 0, 1)",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    },
                ],
            },
            options: {
                onClick: clickLineHandler,
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: "time",
                        title: {
                            display: true,
                            text: "Date",
                        },
                        time: {
                            unit: "day",
                            tooltipFormat: "dd MMM yyyy",
                        },
                        max: maxDate,
                        min: minDate,
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Posts / Days",
                        },
                    },
                },
            },
        };
        let MultilineChart = new Chart(chartHolderHTML, MultilineChartConfig);
        function clickLineHandler(evt) {
            const points = MultilineChart.getElementsAtEventForMode(
                evt,
                "nearest",
                { intersect: true },
                true
            );
            let currentPage = 1;

            if (points.length) {
                const firstPoint = points[0];
                const label = MultilineChart.data.labels[firstPoint.index];

                const value =
                    MultilineChart.data.datasets[firstPoint.datasetIndex].data[
                        firstPoint.index
                    ];
                var ar = [value.user, value.text],
                    table = document.querySelector("table tbody");
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
                    const btn_prev = document.getElementById("btn-prev");
                    const btn_next = document.getElementById("btn-next");
                    let page_span = document.getElementById("page");
                    page_span.style.display = "inline-block";

                    if (page < 1) {
                        page = 1;
                    }

                    if (page > numPage) {
                        page = numPage;
                    }

                    table.textContent = "";
                    page_span.textContent = "";

                    if (recordsPerPage > array.length) {
                        recordsPerPage = array.length;
                    } else {
                        recordsPerPage = 50;
                    }

                    for (
                        let i = (page - 1) * recordsPerPage;
                        i < page * recordsPerPage && i < array.length;
                        i++
                    ) {
                        try {
                            row = table.insertRow(0);
                            var cell1 = row.insertCell(0);
                            var cell2 = row.insertCell(1);
                            cell1.textContent = array[i][0];
                            cell2.textContent = array[i][1];
                        } catch {
                            numPage = page;
                        }
                    }
                    page_span.textContent += page + "/" + numPage;
                    btn_prev.style.display =
                        page === 1 ? "none" : "inline-block";
                    btn_next.style.display =
                        page === numPage ? "none" : "inline-block";
                    let tbl = document.getElementById("tablebubz");
                    if (tbl.rows.length == 1) {
                        btn_page_nav.style.display = "none";
                    }
                }

                function searchArray(array) {
                    input = document.getElementById("searchBar");
                    filter = input.value.toUpperCase();
                    let filtered = array.filter((text) => {
                        return (
                            typeof text[1] == "string" &&
                            text[1].toUpperCase().indexOf(filter) > -1
                        );
                    });
                    currentArray = filtered;
                    currentPage = 1;
                    changePage(currentPage, filtered);
                }

                var r = ar[0].map(function (col, i) {
                    return ar.map(function (row) {
                        return row[i];
                    });
                });

                document
                    .getElementById("searchBar")
                    .addEventListener("keyup", (e) => {
                        e.preventDefault();
                        searchArray(r);
                    });

                document
                    .getElementById("btn-next")
                    .addEventListener("click", (e) => {
                        e.preventDefault();
                        nextPage();
                    });

                document
                    .getElementById("btn-prev")
                    .addEventListener("click", (e) => {
                        e.preventDefault();
                        prevPage();
                    });

                currentArray = r;
                currentPage = 1;
                changePage(currentPage, r);
            }
        }
        if (TWStorage.length > 0) {
            min_r = TWStorage.reduce(function (prev, curr) {
                return prev.r < curr.r ? prev : curr;
            });
            max_r = TWStorage.reduce(function (prev, curr) {
                return prev.r > curr.r ? prev : curr;
            });
            min_x = TWStorage.reduce(function (prev, curr) {
                return prev.x < curr.x ? prev : curr;
            });
            max_x = TWStorage.reduce(function (prev, curr) {
                return prev.x > curr.x ? prev : curr;
            });
        }

        if (RDStorage.length > 0) {
            min_r = RDStorage.reduce(function (prev, curr) {
                return prev.r < curr.r ? prev : curr;
            });
            max_r = RDStorage.reduce(function (prev, curr) {
                return prev.r > curr.r ? prev : curr;
            });
            min_x = RDStorage.reduce(function (prev, curr) {
                return prev.x < curr.x ? prev : curr;
            });
            max_x = RDStorage.reduce(function (prev, curr) {
                return prev.x > curr.x ? prev : curr;
            });
        }

        if (PBStorage.length > 0) {
            min_r = PBStorage.reduce(function (prev, curr) {
                return prev.r < curr.r ? prev : curr;
            });
            max_r = PBStorage.reduce(function (prev, curr) {
                return prev.r > curr.r ? prev : curr;
            });
            min_x = PBStorage.reduce(function (prev, curr) {
                return prev.x < curr.x ? prev : curr;
            });
            max_x = PBStorage.reduce(function (prev, curr) {
                return prev.x > curr.x ? prev : curr;
            });
        }

        chart_sum.textContent = "";
        let chart_sum_paragraph = "";
        if (TWStorage.length > 0) {
            chart_sum_paragraph =
                "Twitter has " +
                TWCount +
                " total amount of Tweets,\r and has a peak of " +
                TWMaxEvent.y +
                " posts on " +
                TWMaxEvent.x +
                "\n";
        }
        if (RDStorage.length > 0) {
            chart_sum_paragraph +=
                "Reddit has " +
                RDCount +
                " total amount of Posts,\r and has a peak of  " +
                RDMaxEvent.y +
                " posts on " +
                RDMaxEvent.x +
                "\n";
        }
        if (PBStorage.length > 0) {
            chart_sum_paragraph +=
                "PasteBin has " +
                PBCount +
                " total amount of Pastes,\r and has a peak of  " +
                PBMaxEvent.y +
                " posts on " +
                PBMaxEvent.x +
                "\n";
        }

        chart_sum.textContent = chart_sum_paragraph;

        chart_sum.textContent = chart_sum_paragraph;
    });
}

function drawBubbleChart() {
    d3.csv("/static/results/charting.csv").then(function (datapoints) {
        // bubble chart
        const bubbleStorage = [];
        const lineBubbleStorage = [];
        var minDate = new Date();
        var maxDate = new Date();
        var max = Math.max.apply(
            Math,
            datapoints.map(function (o) {
                return o.date_count;
            })
        );
        var min = Math.min.apply(
            Math,
            datapoints.map(function (o) {
                return o.date_count;
            })
        );
        for (i = 0; i < datapoints.length; i++) {
            if (datapoints[i].date_count != "") {
                var tDate = datapoints[i].time_count;
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
                        var tzoffset = new Date().getTimezoneOffset() * 60000;
                        var localISOTime = new Date(dateOnly - tzoffset)
                            .toISOString()
                            .slice(0, -1);
                        dateOnly = localISOTime.split("T", 1)[0];
                        if (x == dateOnly) {
                            bubbleText.push(datapoints[a].text);
                            bubbleUser.push(datapoints[a].user);
                        }
                    }
                }
                var json = {
                    x: x,
                    y: y,
                    r: r,
                    text: bubbleText,
                    user: bubbleUser,
                };
                var lineJson = { x: x, y: y };
                bubbleStorage.push(json);
                lineBubbleStorage.push(lineJson);
            }
        }
        maxDate.setDate(maxDate.getDate() + 3);
        minDate.setDate(minDate.getDate() - 1);
        //config
        const bubbleChartConfig = {
            type: "bubble",
            data: {
                datasets: [
                    {
                        label: "No. of Chatter (Scaled)",
                        data: bubbleStorage,
                    },
                    {
                        label: "Line data",
                        type: "line",
                        data: lineBubbleStorage,
                        borderColor: ["rgba(0, 0, 0, 1)"],
                        tension: 0.4,
                    },
                ],
            },
            options: {
                onClick: clickBubbleHandler,
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: "time",
                        title: {
                            display: true,
                            text: "Date",
                        },
                        time: {
                            unit: "day",
                            tooltipFormat: "dd MMM yyyy",
                        },
                        max: maxDate,
                        min: minDate,
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Avg Chatter / Days",
                        },
                    },
                },
            },
        };
        //config
        let bubbleChart = new Chart(chartHolderHTML, bubbleChartConfig);
        function clickBubbleHandler(evt) {
            const points = bubbleChart.getElementsAtEventForMode(
                evt,
                "nearest",
                { intersect: true },
                true
            );
            let currentPage = 1;

            if (points.length) {
                const firstPoint = points[0];
                const label = bubbleChart.data.labels[firstPoint.index];
                const value =
                    bubbleChart.data.datasets[firstPoint.datasetIndex].data[
                        firstPoint.index
                    ];
                var ar = [value.user, value.text],
                    table = document.querySelector("table tbody");
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
                    const btn_prev = document.getElementById("btn-prev");
                    const btn_next = document.getElementById("btn-next");
                    let page_span = document.getElementById("page");
                    page_span.style.display = "inline-block";

                    if (page < 1) {
                        page = 1;
                    }

                    if (page > numPage) {
                        page = numPage;
                    }

                    table.textContent = "";
                    page_span.textContent = "";

                    if (recordsPerPage > array.length) {
                        recordsPerPage = array.length;
                    } else {
                        recordsPerPage = 50;
                    }

                    for (
                        let i = (page - 1) * recordsPerPage;
                        i < page * recordsPerPage && i < array.length;
                        i++
                    ) {
                        try {
                            row = table.insertRow(0);
                            var cell1 = row.insertCell(0);
                            var cell2 = row.insertCell(1);
                            cell1.textContent = array[i][0];
                            cell2.textContent = array[i][1];
                        } catch {
                            numPage = page;
                        }
                    }
                    page_span.textContent += page + "/" + numPage;
                    btn_prev.style.display =
                        page === 1 ? "none" : "inline-block";
                    btn_next.style.display =
                        page === numPage ? "none" : "inline-block";
                    let tbl = document.getElementById("tablebubz");
                    if (tbl.rows.length == 1) {
                        btn_page_nav.style.display = "none";
                    }
                }

                function searchArray(array) {
                    input = document.getElementById("searchBar");
                    filter = input.value.toUpperCase();
                    let filtered = array.filter((text) => {
                        return (
                            typeof text[1] == "string" &&
                            text[1].toUpperCase().indexOf(filter) > -1
                        );
                    });
                    currentArray = filtered;
                    currentPage = 1;
                    changePage(currentPage, filtered);
                }

                var r = ar[0].map(function (col, i) {
                    return ar.map(function (row) {
                        return row[i];
                    });
                });

                document
                    .getElementById("searchBar")
                    .addEventListener("keyup", (e) => {
                        e.preventDefault();
                        searchArray(r);
                    });

                document
                    .getElementById("btn-next")
                    .addEventListener("click", (e) => {
                        e.preventDefault();
                        nextPage();
                    });

                document
                    .getElementById("btn-prev")
                    .addEventListener("click", (e) => {
                        e.preventDefault();
                        prevPage();
                    });

                currentArray = r;
                currentPage = 1;
                changePage(currentPage, r);
            }
        }
        min_r = bubbleStorage.reduce(function (prev, curr) {
            return prev.r < curr.r ? prev : curr;
        });
        max_r = bubbleStorage.reduce(function (prev, curr) {
            return prev.r > curr.r ? prev : curr;
        });
        min_x = bubbleStorage.reduce(function (prev, curr) {
            return prev.x < curr.x ? prev : curr;
        });
        max_x = bubbleStorage.reduce(function (prev, curr) {
            return prev.x > curr.x ? prev : curr;
        });
        chart_sum.textContent = "";
        let chart_sum_paragraph =
            "The date with the most amount of chatter on average is on: " +
            max_r.x +
            "(" +
            max_r.text.length +
            ").\r\n";
        chart_sum_paragraph +=
            "The date with the least amount of chatter on average is on: " +
            min_r.x +
            "(" +
            min_r.text.length +
            ").\r\n";
        chart_sum_paragraph +=
            "The first instance of chatter was on: " + min_x.x + ".\r\n";
        chart_sum_paragraph +=
            "The last instance of chatter was on: " + max_x.x + ".\r\n";
        chart_sum_paragraph += "Sentiment peaked on: " + max_r.x + ".\r\n";
        chart_sum_paragraph +=
            "Sentiment reach its lowest on: " + min_r.x + ".\r\n";
        let counter = datapoints.length;
        while (counter > 0) {
            counter--;
            let foundAttack = false;
            for (let a = 0; a < attackWords.length; a++) {
                foundAttack = datapoints[counter].text
                    .toLowerCase()
                    .includes(attackWords[a]);
            }
            if (foundAttack) {
                chart_sum_paragraph +=
                    "The first post mentioning of any attacks was on: " +
                    datapoints[counter].day +
                    ".\r\n";
                let str = datapoints[counter].text;
                if (str.length > 512) str = str.substring(0, 512) + "...";
                chart_sum_paragraph += "Message: " + str + "\r\n";
                break;
            }
        }
        counter = datapoints.length;
        while (counter > 0) {
            counter--;
            let foundZero = false;
            for (let a = 0; a < zeroDayWords.length; a++) {
                foundZero = datapoints[counter].text
                    .toLowerCase()
                    .includes(zeroDayWords[a]);
            }
            if (foundZero) {
                chart_sum_paragraph += "Zero Day: Potentially.\r\n";
                let str = datapoints[counter].text;
                if (str.length > 512) str = str.substring(0, 512) + "...";
                chart_sum_paragraph += "Message: " + str + "\r\n";
                break;
            }
        }
        chart_sum.textContent = chart_sum_paragraph;
    });
}

function drawCountryChart() {
    d3.csv("/static/results/charting.csv").then(function (datapoints) {
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
            type: "bar",
            data: {
                datasets: [
                    {
                        label: "No. of Tweets Per Country",
                        data: countryStorage,
                        borderColor: ["rgba(0, 0, 0, 1)"],
                        backgroundColor: "#4cb6cb",
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                onClick: clickCountryBarHandler,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Country",
                        },
                        ticks: {
                            beginAtZero: true,
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Total No. of Tweets",
                        },
                        ticks: {
                            beginAtZero: true,
                        },
                        grace: "50%",
                        type: "linear",
                        min: -500,
                    },
                },
            },
        };
        //config
        let countryChart = new Chart(chartHolderHTML, countryChartConfig);
        function clickCountryBarHandler(evt) {
            const points = countryChart.getElementsAtEventForMode(
                evt,
                "nearest",
                { intersect: true },
                true
            );
            let currentPage = 1;

            if (points.length) {
                const firstPoint = points[0];
                const label = countryChart.data.labels[firstPoint.index];
                const value =
                    countryChart.data.datasets[firstPoint.datasetIndex].data[
                        firstPoint.index
                    ];
                let ar = [value.user, value.text],
                    table = document.querySelector("table tbody");
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
                    const btn_prev = document.getElementById("btn-prev");
                    const btn_next = document.getElementById("btn-next");
                    let page_span = document.getElementById("page");
                    page_span.style.display = "inline-block";

                    if (page < 1) {
                        page = 1;
                    }

                    if (page > numPage) {
                        page = numPage;
                    }

                    table.textContent = "";
                    page_span.textContent = "";

                    if (recordsPerPage > array.length) {
                        recordsPerPage = array.length;
                    } else {
                        recordsPerPage = 50;
                    }

                    for (
                        let i = (page - 1) * recordsPerPage;
                        i < page * recordsPerPage && i < array.length;
                        i++
                    ) {
                        try {
                            row = table.insertRow(0);
                            var cell1 = row.insertCell(0);
                            var cell2 = row.insertCell(1);
                            cell1.textContent = array[i][0];
                            cell2.textContent = array[i][1];
                        } catch {
                            numPage = page;
                        }
                    }
                    page_span.textContent += page + "/" + numPage;
                    btn_prev.style.display =
                        page === 1 ? "none" : "inline-block";
                    btn_next.style.display =
                        page === numPage ? "none" : "inline-block";
                    let tbl = document.getElementById("tablebubz");
                    if (tbl.rows.length == 1) {
                        btn_page_nav.style.display = "none";
                    }
                }

                function searchArray(array) {
                    input = document.getElementById("searchBar");
                    filter = input.value.toUpperCase();
                    let filtered = array.filter((text) => {
                        return (
                            typeof text[1] == "string" &&
                            text[1].toUpperCase().indexOf(filter) > -1
                        );
                    });
                    currentArray = filtered;
                    currentPage = 1;
                    changePage(currentPage, filtered);
                }

                var r = ar[0].map(function (col, i) {
                    return ar.map(function (row) {
                        return row[i];
                    });
                });

                document
                    .getElementById("searchBar")
                    .addEventListener("keyup", (e) => {
                        e.preventDefault();
                        searchArray(r);
                    });

                document
                    .getElementById("btn-next")
                    .addEventListener("click", (e) => {
                        e.preventDefault();
                        nextPage();
                    });

                document
                    .getElementById("btn-prev")
                    .addEventListener("click", (e) => {
                        e.preventDefault();
                        prevPage();
                    });

                currentArray = r;
                currentPage = 1;
                changePage(currentPage, r);
            }
        }
        min_y = countryStorage.reduce(function (prev, curr) {
            return prev.y < curr.y ? prev : curr;
        });
        max_y = countryStorage.reduce(function (prev, curr) {
            return prev.y > curr.y ? prev : curr;
        });
        chart_sum.textContent = "";
        let chart_sum_paragraph =
            "The country with the most amount of tweets: " +
            max_y.x +
            "(" +
            max_y.text.length +
            ").\r\n";
        chart_sum_paragraph +=
            "The country with the least amount of tweets: " +
            min_y.x +
            "(" +
            min_y.text.length +
            ").\r\n";
        chart_sum.textContent = chart_sum_paragraph;
    });
}

function drawScatterChart() {
    d3.csv("/static/results/charting.csv").then(function (datapoints) {
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
                        let tzoffset = new Date().getTimezoneOffset() * 60000;
                        let localISOTime = new Date(dateOnly - tzoffset)
                            .toISOString()
                            .slice(0, -1);
                        dateOnly = localISOTime.split("T", 1)[0];

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
            type: "scatter",
            data: {
                datasets: [
                    {
                        label: "Chatter Throughout the hours and days",
                        data: scatterStorage,
                    },
                ],
            },
            options: {
                onClick: clickScatterHandler,
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: "time",
                        title: {
                            display: true,
                            text: "Date",
                        },
                        time: {
                            unit: "day",
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Hour (24H Format)",
                        },
                        min: 0,
                        max: 24,
                    },
                },
            },
        };
        //config
        let scatterChart = new Chart(chartHolderHTML, scatterChartConfig);
        function clickScatterHandler(evt) {
            const points = scatterChart.getElementsAtEventForMode(
                evt,
                "nearest",
                { intersect: true },
                true
            );
            let currentPage = 1;

            if (points.length) {
                const firstPoint = points[0];
                const label = scatterChart.data.labels[firstPoint.index];
                const value =
                    scatterChart.data.datasets[firstPoint.datasetIndex].data[
                        firstPoint.index
                    ];
                var ar = [value.user, value.text],
                    table = document.querySelector("table tbody");
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
                    const btn_prev = document.getElementById("btn-prev");
                    const btn_next = document.getElementById("btn-next");
                    let page_span = document.getElementById("page");
                    page_span.style.display = "inline-block";

                    if (page < 1) {
                        page = 1;
                    }

                    if (page > numPage) {
                        page = numPage;
                    }

                    table.textContent = "";
                    page_span.textContent = "";

                    if (recordsPerPage > array.length) {
                        recordsPerPage = array.length;
                    } else {
                        recordsPerPage = 50;
                    }

                    for (
                        let i = (page - 1) * recordsPerPage;
                        i < page * recordsPerPage && i < array.length;
                        i++
                    ) {
                        try {
                            row = table.insertRow(0);
                            var cell1 = row.insertCell(0);
                            var cell2 = row.insertCell(1);
                            cell1.textContent = array[i][0];
                            cell2.textContent = array[i][1];
                        } catch {
                            numPage = page;
                        }
                    }
                    page_span.textContent += page + "/" + numPage;
                    btn_prev.style.display =
                        page === 1 ? "none" : "inline-block";
                    btn_next.style.display =
                        page === numPage ? "none" : "inline-block";
                    let tbl = document.getElementById("tablebubz");
                    if (tbl.rows.length == 1) {
                        btn_page_nav.style.display = "none";
                    }
                }

                function searchArray(array) {
                    input = document.getElementById("searchBar");
                    filter = input.value.toUpperCase();
                    let filtered = array.filter((text) => {
                        return (
                            typeof text[1] == "string" &&
                            text[1].toUpperCase().indexOf(filter) > -1
                        );
                    });
                    currentArray = filtered;
                    currentPage = 1;
                    changePage(currentPage, filtered);
                }

                var r = ar[0].map(function (col, i) {
                    return ar.map(function (row) {
                        return row[i];
                    });
                });

                document
                    .getElementById("searchBar")
                    .addEventListener("keyup", (e) => {
                        e.preventDefault();
                        searchArray(r);
                    });

                document
                    .getElementById("btn-next")
                    .addEventListener("click", (e) => {
                        e.preventDefault();
                        nextPage();
                    });

                document
                    .getElementById("btn-prev")
                    .addEventListener("click", (e) => {
                        e.preventDefault();
                        prevPage();
                    });

                currentArray = r;
                currentPage = 1;
                changePage(currentPage, r);
            }
        }
        min_text = scatterStorage.reduce(function (prev, curr) {
            return prev.text.length < curr.text.length ? prev : curr;
        });
        max_text = scatterStorage.reduce(function (prev, curr) {
            return prev.text.length > curr.text.length ? prev : curr;
        });
        chart_sum.textContent = "";
        let chart_sum_paragraph =
            "The most amount of chatter on average is on: " +
            max_text.x +
            " " +
            max_text.y +
            "00hrs" +
            "(" +
            max_text.text.length +
            ").\r\n";
        chart_sum_paragraph +=
            "The least amount of chatter on average is on: " +
            max_text.x +
            " " +
            min_text.y +
            "00hrs" +
            "(" +
            min_text.text.length +
            ").\r\n";
        chart_sum.textContent = chart_sum_paragraph;
    });
}

function drawDoughnutChart() {
    d3.csv("/static/results/charting.csv").then(function (datapoints) {
        let noPosts = [];
        let names = [];
        let x;
        for (i = 0; i < datapoints.length; i++) {
            if (datapoints[i].date != "") {
                if (datapoints[i].platform == "twitter") {
                    if (!names.includes(datapoints[i].user)) {
                        names.push(datapoints[i].user);
                        x = datapoints.filter(
                            (a) => a.user == datapoints[i].user
                        );

                        noPosts.push({
                            name: datapoints[i].user,
                            posts: x.length,
                            platform: "twitter",
                        });
                    }
                } else if (datapoints[i].platform == "reddit") {
                    if (!names.includes(datapoints[i].user)) {
                        names.push(datapoints[i].user);
                        x = datapoints.filter(
                            (a) => a.user == datapoints[i].user
                        );

                        noPosts.push({
                            name: datapoints[i].user,
                            posts: x.length,
                            platform: "reddit",
                        });
                    }
                } else if (datapoints[i].platform == "pastebin") {
                    if (!names.includes(datapoints[i].user)) {
                        names.push(datapoints[i].user);
                        x = datapoints.filter(
                            (a) => a.user == datapoints[i].user
                        );

                        noPosts.push({
                            name: datapoints[i].user,
                            posts: x.length,
                            platform: "pastebin",
                        });
                    }
                }
            }
        }

        var topPostValues = [...noPosts]
            .sort((a, b) => b.posts - a.posts)
            .slice(0, 5);

        topPoster = [...topPostValues];
        const data = {
            labels: [
                topPostValues[0].name,
                topPostValues[1].name,
                topPostValues[2].name,
                topPostValues[3].name,
                topPostValues[4].name,
            ],
            datasets: [
                {
                    label: "Dataset 1",
                    data: [
                        topPostValues[0].posts,
                        topPostValues[1].posts,
                        topPostValues[2].posts,
                        topPostValues[3].posts,
                        topPostValues[4].posts,
                    ],
                    backgroundColor: [
                        "Red",
                        "Orange",
                        "Yellow",
                        "Green",
                        "Blue",
                    ],
                },
            ],
        };

        //Doughnut chart
        const DoughnutChartConfig = {
            type: "doughnut",
            data: data,
            options: {
                onClick: clickDoughnutHandler,
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    title: {
                        display: false,
                        text: "Top 5 most frequent posters",
                    },
                },
            },
        };

        let DoughnutChart = new Chart(chartHolderHTML, DoughnutChartConfig);
        function clickDoughnutHandler(evt) {
            const points = DoughnutChart.getElementsAtEventForMode(
                evt,
                "nearest",
                { intersect: true },
                true
            );
            let currentPage = 1;
            if (points.length) {
                const firstPoint = points[0];
                const label = DoughnutChart.data.labels[firstPoint.index];
                const value = datapoints.filter(
                    (a) => a.user == topPoster[points[0].index].name
                );
                var ar = [...value];
                table = document.querySelector("table tbody");
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
                    const btn_prev = document.getElementById("btn-prev");
                    const btn_next = document.getElementById("btn-next");
                    let page_span = document.getElementById("page");
                    page_span.style.display = "inline-block";

                    if (page < 1) {
                        page = 1;
                    }

                    if (page > numPage) {
                        page = numPage;
                    }

                    table.textContent = "";
                    page_span.textContent = "";

                    if (recordsPerPage > array.length) {
                        recordsPerPage = array.length;
                    } else {
                        recordsPerPage = 50;
                    }

                    for (
                        let i = (page - 1) * recordsPerPage;
                        i < page * recordsPerPage && i < array.length;
                        i++
                    ) {
                        try {
                            row = table.insertRow(0);
                            var cell1 = row.insertCell(0);
                            var cell2 = row.insertCell(1);
                            cell1.textContent = array[i].user;
                            cell2.textContent = array[i].text;
                        } catch {
                            numPage = page;
                        }
                    }
                    page_span.textContent += page + "/" + numPage;
                    btn_prev.style.display =
                        page === 1 ? "none" : "inline-block";
                    btn_next.style.display =
                        page === numPage ? "none" : "inline-block";
                    let tbl = document.getElementById("tablebubz");
                    if (tbl.rows.length == 1) {
                        btn_page_nav.style.display = "none";
                    }
                }

                function searchArray(array) {
                    input = document.getElementById("searchBar");
                    filter = input.value.toUpperCase();
                    let filtered = array.filter((text) => {
                        return (
                            typeof text[1] == "string" &&
                            text[1].toUpperCase().indexOf(filter) > -1
                        );
                    });
                    currentArray = filtered;
                    currentPage = 1;
                    changePage(currentPage, filtered);
                }

                document
                    .getElementById("searchBar")
                    .addEventListener("keyup", (e) => {
                        e.preventDefault();
                        searchArray(r);
                    });

                document
                    .getElementById("btn-next")
                    .addEventListener("click", (e) => {
                        e.preventDefault();
                        nextPage();
                    });

                document
                    .getElementById("btn-prev")
                    .addEventListener("click", (e) => {
                        e.preventDefault();
                        prevPage();
                    });
                currentArray = ar;
                currentPage = 1;
                changePage(currentPage, ar);
            }
        }

        chart_sum.textContent = "";
        let chart_sum_paragraph = "";

        chart_sum_paragraph += "The top five most frequent posters are\r\n";
        for (let a = 0; a < topPostValues.length; a++) {
            chart_sum_paragraph +=
                a +
                1 +
                ") user: " +
                topPostValues[a].name +
                " with " +
                topPostValues[a].posts +
                " from the " +
                topPostValues[a].platform +
                " platform.\r\n";
        }

        chart_sum.textContent = chart_sum_paragraph;
    });
}

function formatter(n) {
    var str = n.toString().split(".");
    str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return str.join(".");
}

function drawFollowersChart() {
    d3.csv("/static/results/charting.csv").then(function (datapoints) {
        let noPosts = [];
        let names = [];

        for (i = 0; i < datapoints.length; i++) {
            if (datapoints[i].date_count != "") {
                if (!names.includes(datapoints[i].user)) {
                    names.push(datapoints[i].user);
                    let x = datapoints.filter(
                        (a) => a.user == datapoints[i].user
                    );
                    noPosts.push({
                        name: datapoints[i].user,
                        posts: x.length,
                        followers: datapoints[i].followers,
                        following: datapoints[i].following,
                    });
                }
            }
        }
        var topfollowerValues = [...noPosts]
            .sort((a, b) => b.followers - a.followers)
            .slice(0, 5);
        var topfollowingValues = [...noPosts]
            .sort((a, b) => b.following - a.following)
            .slice(0, 5);
        topFollowers = topfollowerValues.concat(topfollowingValues);
        const barchartdata = {
            labels: [
                topfollowerValues[0].name,
                topfollowerValues[1].name,
                topfollowerValues[2].name,
                topfollowerValues[3].name,
                topfollowerValues[4].name,
                topfollowingValues[0].name,
                topfollowingValues[1].name,
                topfollowingValues[2].name,
                topfollowingValues[3].name,
                topfollowingValues[4].name,
            ],
            datasets: [
                {
                    label: "followers",
                    data: [
                        topfollowerValues[0].followers,
                        topfollowerValues[1].followers,
                        topfollowerValues[2].followers,
                        topfollowerValues[3].followers,
                        topfollowerValues[4].followers,
                        topfollowingValues[0].followers,
                        topfollowingValues[1].followers,
                        topfollowingValues[2].followers,
                        topfollowingValues[3].followers,
                        topfollowingValues[4].followers,
                    ],
                    borderColor: "#ffb1c1",
                    backgroundColor: "rgba(255, 110, 141, 0.5)",
                },
                {
                    label: "following",
                    data: [
                        topfollowerValues[0].following,
                        topfollowerValues[1].following,
                        topfollowerValues[2].following,
                        topfollowerValues[3].following,
                        topfollowerValues[4].following,
                        topfollowingValues[0].following,
                        topfollowingValues[1].following,
                        topfollowingValues[2].following,
                        topfollowingValues[3].following,
                        topfollowingValues[4].following,
                    ],
                    borderColor: "#4faded",
                    backgroundColor: "rgba(154,208,245,0.5)",
                },
            ],
        };
        const FollowerChartconfig = {
            type: "bar",
            data: barchartdata,
            options: {
                onClick: clickFollowerBarHandler,
                indexAxis: "y",
                elements: {
                    bar: {
                        borderWidth: 2,
                    },
                },
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    legend: {
                        position: "right",
                    },
                    title: {
                        display: false,
                        text: "Most number of Twitter followers",
                    },
                },
            },
        };

        var followerChart = new Chart(chartHolderHTML, FollowerChartconfig);
        function clickFollowerBarHandler(evt) {
            const points = followerChart.getElementsAtEventForMode(
                evt,
                "nearest",
                { intersect: true },
                true
            );
            let currentPage = 1;
            if (points.length) {
                const firstPoint = points[0];
                const label = followerChart.data.labels[firstPoint.index];
                const value = datapoints.filter(
                    (a) => a.user == topFollowers[points[0].index].name
                );
                var ar = [...value];
                table = document.querySelector("table tbody");
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
                    const btn_prev = document.getElementById("btn-prev");
                    const btn_next = document.getElementById("btn-next");
                    let page_span = document.getElementById("page");
                    page_span.style.display = "inline-block";

                    if (page < 1) {
                        page = 1;
                    }

                    if (page > numPage) {
                        page = numPage;
                    }

                    table.textContent = "";
                    page_span.textContent = "";

                    if (recordsPerPage > array.length) {
                        recordsPerPage = array.length;
                    } else {
                        recordsPerPage = 50;
                    }

                    for (
                        let i = (page - 1) * recordsPerPage;
                        i < page * recordsPerPage && i < array.length;
                        i++
                    ) {
                        try {
                            row = table.insertRow(0);
                            var cell1 = row.insertCell(0);
                            var cell2 = row.insertCell(1);
                            cell1.textContent = array[i].user;
                            cell2.textContent = array[i].text;
                        } catch {
                            numPage = page;
                        }
                    }
                    page_span.textContent += page + "/" + numPage;
                    btn_prev.style.display =
                        page === 1 ? "none" : "inline-block";
                    btn_next.style.display =
                        page === numPage ? "none" : "inline-block";
                    let tbl = document.getElementById("tablebubz");
                    if (tbl.rows.length == 1) {
                        btn_page_nav.style.display = "none";
                    }
                }

                function searchArray(array) {
                    input = document.getElementById("searchBar");
                    filter = input.value.toUpperCase();
                    let filtered = array.filter((text) => {
                        return (
                            typeof text[1] == "string" &&
                            text[1].toUpperCase().indexOf(filter) > -1
                        );
                    });
                    currentArray = filtered;
                    currentPage = 1;
                    changePage(currentPage, filtered);
                }

                document
                    .getElementById("searchBar")
                    .addEventListener("keyup", (e) => {
                        e.preventDefault();
                        searchArray(r);
                    });

                document
                    .getElementById("btn-next")
                    .addEventListener("click", (e) => {
                        e.preventDefault();
                        nextPage();
                    });

                document
                    .getElementById("btn-prev")
                    .addEventListener("click", (e) => {
                        e.preventDefault();
                        prevPage();
                    });
                currentArray = ar;
                currentPage = 1;
                changePage(currentPage, ar);
            }
        }

        chart_sum.textContent = "";
        let chart_sum_paragraph = "";

        chart_sum_paragraph =
            "The Twitter account with most followers is " +
            topfollowerValues[0].name +
            " with " +
            formatter(parseInt(topfollowerValues[0].followers)) +
            " of followers.\n" +
            "The Twitter account with the most following is " +
            topfollowingValues[0].name +
            " with " +
            formatter(parseInt(topfollowerValues[0].following)) +
            " of followings.\r\n";

        chart_sum.textContent = chart_sum_paragraph;
    });
}
