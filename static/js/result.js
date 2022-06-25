const form = document.forms[0];
const bubbleChartHTML = document.querySelector("#graph").getContext("2d");
const countryChartHTML = document.querySelector("#countryGraph").getContext("2d");
const multilineChartHTML = document.querySelector("#timeline").getContext("2d");

let recordsPerPage = 50;
let numPage = 1;
let currentArray = [];

d3.csv('/static/results/charting.csv').then(function(datapoints){
    // bubble chart
    const bubbleStorage = [];
	var TWCount=0;
	var RDCount=0;
	var PBCount=0;
	var TWSeries=[];
	var RDSeries=[];
	var PBSeries=[];
	
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
		if (datapoints[i].date!="") {
			if(datapoints[i].platform=="twitter") {
				TWCount=TWCount+parseInt(datapoints[i].count);
				TWSeries.push({x: datapoints[i].date, y:parseInt(datapoints[i].count)});
			}
			else if(datapoints[i].platform=="reddit") {
				RDCount=RDCount+parseInt(datapoints[i].count);
				RDSeries.push({x: datapoints[i].date, y:parseInt(datapoints[i].count)});
			}
			else if(datapoints[i].platform=="pastebin") {
				PBCount=PBCount+parseInt(datapoints[i].count);
				PBSeries.push({x: datapoints[i].date, y:parseInt(datapoints[i].count)});
			}
		}
    }
	
    const ratio = (100-1)/(max-min);
    const diffTime = Math.abs(maxDate - minDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    for (let i = 0; i < datapoints.length; i++) {
        var bubbleText = [];
        var bubbleUser = [];
        if (datapoints[i].date_count != "") {
            var x = datapoints[i].time_count;
            var r = datapoints[i].date_count;
            var y = r/diffDays;
            r = Math.floor(1 + ratio*(r-min));

            for (let a = 0; a < datapoints.length; a++) {
                var dateOnly = new Date(datapoints[a].time);
                dateOnly = dateOnly.toISOString().substring(0,10);
                if (x == dateOnly) {
                    bubbleText.push(datapoints[a].text);
                    bubbleUser.push(datapoints[a].user);
                }
            }
            var json = {x: x, y: y, r: r, text: bubbleText, user: bubbleUser};
            bubbleStorage.push(json);
        }
    }
    maxDate.setDate(maxDate.getDate() + 5);
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
    var bubbleChart = new Chart(bubbleChartHTML, bubbleChartConfig);

    function clickBubbleHandler(evt) {
        const points = bubbleChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        let currentPage = 1;

        if (points.length) {
            const firstPoint = points[0];
            const label = bubbleChart.data.labels[firstPoint.index];
            const value = bubbleChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
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
                        numPage = page;
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

    // country bar chart
    const countryStorage = [];

    for (let i = 0; i < datapoints.length; i++) {
        var countryText = [];
        var countryUser = [];
        if (datapoints[i].country_count != "") {
            var x = datapoints[i].location_count;
            var y = datapoints[i].country_count;

            for (let a = 0; a < datapoints.length; a++) {
                if (x == datapoints[a].location) {
                    countryText.push(datapoints[a].text);
                    countryUser.push(datapoints[a].user);
                }
            }
            var json = {x: x, y: y, text: countryText, user: countryUser};
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
    var countryChart = new Chart(countryChartHTML, countryChartConfig);

    function clickCountryBarHandler(evt) {
        const points = countryChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        let currentPage = 1;

        if (points.length) {
            const firstPoint = points[0];
            const label = countryChart.data.labels[firstPoint.index];
            const value = countryChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
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
                        numPage = page;
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
	
	//wordcloud 
	function wordcloud(myWords) {
		var margin = { top: 10, right: 10, bottom: 10, left: 10 }
		//calculate size of canvas
		width = 520 - margin.left - margin.right;
		height = 350 - margin.top - margin.bottom;
		
		
		//positioning
		var svg = d3.select("#word-cloud").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform","translate(" + margin.left + "," + margin.top + ")");

		var layout = d3.layout.cloud()
			.size([width, height])
			.words(myWords.map(function(d) { return {text: d.word, size:d.size}; }))
			.padding(5)
			.rotate(function() { return ~~(Math.random() * 2) * 90; })
			.fontSize(function(d) { return d.size/2; }) 
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
				.style("font-size", function(d) { return d.size; })
				.style("fill", "#bd7dab")
				.attr("text-anchor", "middle")
				.style("font-family", "K2D")
				.attr("transform", function(d) {
				    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
				})
			    .text(function(d) { return d.text; });
		}
	}

    //usernamecloud
	function usernamecloud(myWords) {
		var margin = {top: 10, right: 10, bottom: 10, left: 10}
		//calculate size of canvas
		width = 520 - margin.left - margin.right;
		height = 350 - margin.top - margin.bottom;

		//positioning
		var svg = d3.select("#username-cloud").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform","translate(" + margin.left + "," + margin.top + ")");

		var layout = d3.layout.cloud()
			.size([width, height])
			.words(myWords.map(function(d) { return {text: d.user, size:d.size}; }))
			.padding(5)
			.rotate(function() { return ~~(Math.random() * 2) * 90; })
			.fontSize(function(d) { return d.size/2; })
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
			  .style("font-size", function(d) { return d.size; })
			  .style("fill", "#5cacc2")
			  .attr("text-anchor", "middle")
			  .style("font-family", "K2D")
			  .attr("transform", function(d) {
				  return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
			  })
		      .text(function(d) { return d.text; });
		}
	}
	
	wordcloud(datapoints);
	usernamecloud(datapoints);

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
                        tooltipFormat: 'DD MMM YYYY',
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
	
	var MultilineChart = new Chart(multilineChartHTML, MultilineChartConfig);

	document.getElementById("CountTW").innerHTML=TWCount
	document.getElementById("CountRD").innerHTML=RDCount
	document.getElementById("CountPB").innerHTML=PBCount
});
