const width = window.innerWidth;
const height = window.innerHeight;
let resetButton = document.getElementById("reset_graph");
let userFollowing = document.getElementById("user_following");
let userIndirect = document.getElementById("user_indirect");
let topFive = document.getElementById("top_five");
let btmFive = document.getElementById("bottom_five");
let mostFollowing = document.getElementById("most_following");
let mostFollower = document.getElementById("most_follower");
let leastFollowing = document.getElementById("least_following");
let leastFollower = document.getElementById("least_follower");
let parent = document.getElementById("parent");
let following = document.getElementById("following");
let followers = document.getElementById("followers");
let potentialInfluenced = document.getElementById("potential_influenced");

const postgraph = document.getElementById("postgraph");
const chartHolderHTML = document.getElementById("graph");
let post = document.getElementById("postChart");
let mostFollowings = document.getElementById("mostFollowingChart");
let leastFollowings = document.getElementById("leastFollowingChart");
let mostFollowers = document.getElementById("mostFollowersChart");
let leastFollowers = document.getElementById("leastFollowersChart");
let mostInfluential = document.getElementById("mostInfluentialChart");
let leastInfluential = document.getElementById("leastInfluentialChart");

resetButton.addEventListener("click", function () {
    d3.selectAll("svg > *").remove();
    parent.textContent = "";
    following.textContent = "";
    followers.textContent = "";
    drawGraph();
    drawMostFollowing();
});

mostFollowings.addEventListener("click", function () {
    removeActive();
    mostFollowings.className += " active";
    destroyChart();
    drawMostFollowing();
});

leastFollowings.addEventListener("click", function () {
    removeActive();
    leastFollowings.className += " active";
    destroyChart();
    drawLeastFollowing();
});

mostFollowers.addEventListener("click", function () {
    removeActive();
    mostFollowers.className += " active";
    destroyChart();
    drawMostFollowers();
});

leastFollowers.addEventListener("click", function () {
    removeActive();
    leastFollowers.className += " active";
    destroyChart();
    drawLeastFollowers();
});

mostInfluential.addEventListener("click", function () {
    removeActive();
    mostInfluential.className += " active";
    destroyChart();
    drawMostInfluential();
});

leastInfluential.addEventListener("click", function () {
    removeActive();
    leastInfluential.className += " active";
    destroyChart();
    drawLeastInfluential();
});

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

const svg = d3.select("svg").attr("width", width).attr("height", height);

function drawGraph() {
    d3.json("/static/results/twitter_friendship.json").then(function (data) {
        const nodes = data["nodes"];
        const links = data["links"];
        const level = data["level"];
        const users = data["users"];
        const top_five = data["top_five"];
        const searched_user = data["searched_user"];
        document.title = searched_user;
        document.getElementById("query").textContent =
            searched_user + " | Level: " + level + " | Users: " + users;
        let user_follows_paragraph = searched_user + " directly influenced by: "
        let user_indirect_paragraph = searched_user + " indirectly influenced by: "
        let potential_influenced_paragraph = searched_user + " is likely to be influenced by: ";
        let user_follows_array = [];
        let user_indirect_follows_array = [];
        for (let i = 0; i < links.length; i++) {
            if (links[i].source === searched_user) {
                user_follows_array.push(links[i].target);
            }
        }
        for (let i = 0; i < user_follows_array.length; i++) {
            let chosen_user = user_follows_array[i];
            for (let a = 0; a < links.length; a++) {
                if (links[a].source === chosen_user) {
                    if (links[a].target === searched_user) {
                    } else if (user_follows_array.includes(links[a].target)) {
                    } else if (user_indirect_follows_array.includes(links[a].target)) {
                    } else {
                        user_indirect_follows_array.push(links[a].target);
                    }
                }
            }
        }
        for (let i = 0; i < user_indirect_follows_array.length; i++) {
            user_indirect_paragraph += user_indirect_follows_array[i];
            if (i < user_indirect_follows_array.length - 2) {
                user_indirect_paragraph += ", ";
            } else if (i == user_indirect_follows_array.length - 2) {
                user_indirect_paragraph += " and ";
            }
        }

        let tempArray = user_follows_array.concat(user_indirect_follows_array);
        const influential_users = top_five.map(function (obj) {
            return obj.user;
        });
        let intersection = tempArray.filter(x => influential_users.includes(x));
        for (let i = 0; i < intersection.length; i++) {
            if (intersection.length === 5) {
                potential_influenced_paragraph += "The top 5 most influential users";
                break;
            } else {
                potential_influenced_paragraph += intersection[i];
                if (i < intersection.length - 2) {
                    potential_influenced_paragraph += ", ";
                } else if (i == intersection.length - 2) {
                    potential_influenced_paragraph += " and ";
                }
            }
        }

        for (let i = 0; i < user_follows_array.length; i++) {
            user_follows_paragraph += user_follows_array[i];
            if (i < user_follows_array.length - 2) {
                user_follows_paragraph += ", ";
            } else if (i == user_follows_array.length - 2) {
                user_follows_paragraph += " and ";
            }
        }

        userFollowing.textContent = user_follows_paragraph;
        userIndirect.textContent = user_indirect_paragraph;
        potentialInfluenced.textContent = potential_influenced_paragraph;

        const simulation = d3
            .forceSimulation()
            .force("charge", d3.forceManyBody().strength(-500))
            .force("center", d3.forceCenter(width / 2, height / 2));

        const nodeElements = svg
            .append("g")
            .selectAll("circle")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("r", 20)
            .attr("fill", function (d) {
                return d.color;
            });

        const textElements = svg
            .append("g")
            .selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .text((node) => node.user)
            .attr("font-size", 10)
            .attr("dx", 25)
            .attr("dy", 4)
            .attr("fill", "black");

        simulation.nodes(nodes).on("tick", () => {
            nodeElements
                .attr("cx", (node) => node.x)
                .attr("cy", (node) => node.y)
                .call(drag)
                .on("click", selectNode);
            textElements
                .attr("x", (node) => node.x)
                .attr("y", (node) => node.y);
            linkElements
                .attr("x1", (link) => link.source.x)
                .attr("y1", (link) => link.source.y)
                .attr("x2", (link) => link.target.x)
                .attr("y2", (link) => link.target.y);
        });

        simulation.force(
            "link",
            d3
                .forceLink(links)
                .id(function (d) {
                    return d.user;
                })
                .distance(200)
        );

        const linkElements = svg
            .append("g")
            .selectAll("line")
            .data(links)
            .enter()
            .append("line")
            .attr("stroke-width", function (d) {
                return d.value;
            })
            .attr("stroke", function (d) {
                return d.color;
            });

        simulation.force("link").links(links);

        function handleZoom(e) {
            d3.selectAll("svg g").attr("transform", e.transform);
        }

        let zoom = d3.zoom()
            .scaleExtent([.5, 20])
            .extent([[0, 0], [width, height]])
            .on("zoom", handleZoom);

        let zoomElem = d3.select("svg").call(zoom);

        function reset() {
            zoomElem.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity);
        }
        reset();

        const drag = d3
            .drag()
            .on("start", drag_start)
            .on("drag", drag_drag)
            .on("end", drag_end);

        function drag_start(event, d) {
            if (!event.active) {
                simulation.alphaTarget(0.3).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
        }

        function drag_drag(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function drag_end(event, d) {
            if (!event.active) {
                simulation.alphaTarget(0);
            }
            d.fx = null;
            d.fy = null;
        }

        function getNeighbors(node) {
            return links.reduce(
                (neighbors, links) => {
                    if (links.target.user === node.target.__data__.user) {
                        neighbors.push(links.source);
                    } else if (
                        links.source.user === node.target.__data__.user
                    ) {
                        neighbors.push(links.target);
                    }
                    return neighbors;
                },
                [node.target.__data__.user]
            );
        }

        function getNeighborsAndLinks(node) {
            return links.reduce(
                (neighbors, links) => {
                    if (links.target.user === node.target.__data__.user) {
                        let obj = links.source;
                        obj.link = links.value;
                        neighbors.push(obj);
                    } else if (
                        links.source.user === node.target.__data__.user
                    ) {
                        let obj = links.target;
                        obj.link = links.value;
                        neighbors.push(obj);
                    }
                    return neighbors;
                },
                [node.target.__data__.user]
            );
        }

        function getNodeAndColor(node, neighborArray) {
            if (neighborArray.includes(node.user)) {
                return "black";
            } else {
                return node.color;
            }
        }

        function isNeighborLink(node, link) {
            return (
                link.target.user === node.target.__data__.user ||
                link.source.user === node.target.__data__.user
            );
        }

        function getLinkAndColor(node, link) {
            return isNeighborLink(node, link) ? "black" : link.color;
        }

        function displayNeighbors(neighbors) {
            parent_paragraph = "You have selected: " + neighbors[0].user;
            follows_paragraph = neighbors[0].user + " follow(s): ";
            followers_paragraph = neighbors[0].user + " follower(s): ";
            for (let i = 0; i < neighbors.length; i++) {
                if (i == 0) {
                    i += 1;
                }
                follows_paragraph += neighbors[i].user;
                if (i < neighbors.length - 2) {
                    follows_paragraph += ", ";
                } else if (i == neighbors.length - 2) {
                    follows_paragraph += " and ";
                }
            }
            followerArray = neighbors.filter(function (d) {
                return d.link === 3;
            });
            if (followerArray.length !== 0) {
                for (let i = 0; i < followerArray.length; i++) {
                    followers_paragraph += followerArray[i].user;
                    if (i < followerArray.length - 2) {
                        followers_paragraph += ", ";
                    } else if (i === followerArray.length - 2) {
                        followers_paragraph += " and ";
                    }
                }
            } else {
                followers_paragraph += " None";
            }
            parent.textContent = parent_paragraph;
            following.textContent = follows_paragraph;
            followers.textContent = followers_paragraph;
        }

        function selectNode(selectedNode) {
            const neighborArray = [];
            const neighborAndLinksArray = [];
            const neighbors = getNeighbors(selectedNode);
            const neighborsAndLinks = getNeighborsAndLinks(selectedNode);

            for (let i = 0; i < neighbors.length; i++) {
                if (i == 0) {
                    neighborArray.push(neighbors[0]);
                    i += 1;
                }
                neighborArray.push(neighbors[i].user);
            }

            for (let i = 0; i < neighborsAndLinks.length; i++) {
                if (i == 0) {
                    neighborAndLinksArray.push({ user: neighborsAndLinks[0] });
                    i += 1;
                }
                neighborAndLinksArray.push(neighborsAndLinks[i]);
            }
            let uniqueNeighborAndLinksArray = [
                ...new Map(
                    neighborAndLinksArray.map((item) => [item["user"], item])
                ).values(),
            ];
            displayNeighbors(uniqueNeighborAndLinksArray);

            nodeElements.attr("fill", (node) =>
                getNodeAndColor(node, neighborArray)
            );
            textElements.attr("fill", (node) =>
                getNodeAndColor(node, neighborArray)
            );
            linkElements.attr("stroke", (link) =>
                getLinkAndColor(selectedNode, link)
            );
        }
    });
}

function drawPost() {
    var searched_user = "";
    const postStorage = [];
    d3.json("/static/results/twitter_friendship.json").then(function (data) {
        searched_user = data["searched_user"];
        document.getElementById("queries").textContent = searched_user;
        d3.csv("/static/results/charting.csv").then(function (data) {
            for (let i = 0; i < data.length; i++) {
                if (data[i].user == searched_user) {
                    let json = [data[i].day, data[i].text];
                    postStorage.push(json);
                }
            }
            const postData = {
                type: 'line',
                data: {
                    labels: ["Date", "Post"],
                    datasets: postStorage,
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                reverse: false
                            }
                        }]
                    }
                }
            };

            const xAxis = postData.data.labels;
            const yAxis = postData.data.datasets;
            const tableHeader = `<tr>${xAxis.reduce((memo, entry) => { memo += `<th>${entry}</th>`; return memo; }, '<th></th>')
                }</tr>`;

            var tableBody = "";
            for (let i = 0; i < yAxis.length; i++) {
                tableBody += `<tr><td>` + yAxis[i][0] + `</td><td>`+ yAxis[i][1]+ `</td></tr>`;
            }

            const table = `<table id="tab">${tableHeader}${tableBody}</table>`;
            postgraph.innerHTML = table;

        });
    });

}

function drawMostFollowing() {
    d3.json("/static/results/twitter_friendship.json").then(function (data) {
        const most_following = data["most_following"];
        let names = [];
        let noPosts = [];

        for (i = 0; i < most_following.length; i++) {
            names.push(most_following[i].user);
            noPosts.push({
                name: most_following[i].user,
                following: most_following[i].counts,
            });
        }

        var topfollowingValues = [...noPosts]
            .sort((a, b) => b.following - a.following)
            .slice(0, 5);

        const topfollowingdata = {
            labels: [
                topfollowingValues[0].name,
                topfollowingValues[1].name,
                topfollowingValues[2].name,
                topfollowingValues[3].name,
                topfollowingValues[4].name,
            ],
            datasets: [
                {
                    label: "No. of Following",
                    data: [
                        topfollowingValues[0].following,
                        topfollowingValues[1].following,
                        topfollowingValues[2].following,
                        topfollowingValues[3].following,
                        topfollowingValues[4].following,
                    ],
                    borderColor: "#ffb1c1",
                    backgroundColor: "rgba(255, 110, 141, 0.5)",
                },
            ]
        };

        const MostFollowingChartconfig = {
            type: "bar",
            data: topfollowingdata,
            options: {
                onClick: clickMostFollowingHandler,
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
                        text: "Top 5 Most Amount of Following",
                    },
                },
            },
        };

        let mFollowingChart = new Chart(chartHolderHTML, MostFollowingChartconfig);
        function clickMostFollowingHandler(evt) {
            const points = mFollowingChart.getElementsAtEventForMode(
                evt,
                "nearest",
                { intersect: true },
                true
            );
        }
});
}

function drawLeastFollowing() {
    d3.json("/static/results/twitter_friendship.json").then(function (data) {
        const least_following = data["least_following"];

        let names = [];
        let noPosts = [];

        for (i = 0; i < least_following.length; i++) {
            names.push(least_following[i].user);
            noPosts.push({
                name: least_following[i].user,
                following: least_following[i].counts,
            });
        }

        var btmfollowingValues = [...noPosts]
            .sort((a, b) => b.following - a.following)
            .slice(0, 5);

        const btmfollowingdata = {
            labels: [
                btmfollowingValues[0].name,
                btmfollowingValues[1].name,
                btmfollowingValues[2].name,
                btmfollowingValues[3].name,
                btmfollowingValues[4].name,
            ],
            datasets: [
                {
                    label: "No. of Following",
                    data: [
                        btmfollowingValues[0].following,
                        btmfollowingValues[1].following,
                        btmfollowingValues[2].following,
                        btmfollowingValues[3].following,
                        btmfollowingValues[4].following,
                    ],
                    borderColor: "#ffb1c1",
                    backgroundColor: "rgba(255, 110, 141, 0.5)",
                },
            ]
        };

        const LeastFollowingChartconfig = {
            type: "bar",
            data: btmfollowingdata,
            options: {
                onClick: clickLeastFollowingHandler,
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
                        text: "Top 5 Least Amount of Following",
                    },
                },
            },
        };

        let lFollowingChart = new Chart(chartHolderHTML, LeastFollowingChartconfig);
        function clickLeastFollowingHandler(evt) {
            const points = lFollowingChart.getElementsAtEventForMode(
                evt,
                "nearest",
                { intersect: true },
                true
            );
        }
    });
}

function drawMostFollowers() {
    d3.json("/static/results/twitter_friendship.json").then(function (data) {
        const most_follower = data["most_follower"];

        let names = [];
        let noPosts = [];

        for (i = 0; i < most_follower.length; i++) {
            names.push(most_follower[i].user);
            noPosts.push({
                name: most_follower[i].user,
                following: most_follower[i].counts,
            });
        }

        var topfollowerValues = [...noPosts]
            .sort((a, b) => b.following - a.following)
            .slice(0, 5);

        const topfollowersdata = {
            labels: [
                topfollowerValues[0].name,
                topfollowerValues[1].name,
                topfollowerValues[2].name,
                topfollowerValues[3].name,
                topfollowerValues[4].name,
            ],
            datasets: [
                {
                    label: "No. of Followers",
                    data: [
                        topfollowerValues[0].following,
                        topfollowerValues[1].following,
                        topfollowerValues[2].following,
                        topfollowerValues[3].following,
                        topfollowerValues[4].following,
                    ],
                    borderColor: "#ffb1c1",
                    backgroundColor: "rgba(255, 110, 141, 0.5)",
                },
            ]
        };

        const MostFollowersChartconfig = {
            type: "bar",
            data: topfollowersdata,
            options: {
                onClick: clickMostFollowersHandler,
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
                        text: "Top 5 Most Amount of Followers",
                    },
                },
            },
        };

        let mFollowersChart = new Chart(chartHolderHTML, MostFollowersChartconfig);
        function clickMostFollowersHandler(evt) {
            const points = mFollowersChart.getElementsAtEventForMode(
                evt,
                "nearest",
                { intersect: true },
                true
            );
        }
    });
}

function drawLeastFollowers() {
    d3.json("/static/results/twitter_friendship.json").then(function (data) {
        const least_follower = data["least_follower"];

        let names = [];
        let noPosts = [];

        for (i = 0; i < least_follower.length; i++) {
            names.push(least_follower[i].user);
            noPosts.push({
                name: least_follower[i].user,
                following: least_follower[i].counts,
            });
        }

        var btmfollowerValues = [...noPosts]
            .sort((a, b) => b.following - a.following)
            .slice(0, 5);

        const btmfollowersdata = {
            labels: [
                btmfollowerValues[0].name,
                btmfollowerValues[1].name,
                btmfollowerValues[2].name,
                btmfollowerValues[3].name,
                btmfollowerValues[4].name,
            ],
            datasets: [
                {
                    label: "No. of Followers",
                    data: [
                        btmfollowerValues[0].following,
                        btmfollowerValues[1].following,
                        btmfollowerValues[2].following,
                        btmfollowerValues[3].following,
                        btmfollowerValues[4].following,
                    ],
                    borderColor: "#ffb1c1",
                    backgroundColor: "rgba(255, 110, 141, 0.5)",
                },
            ]
        };

        const LeastFollowersChartconfig = {
            type: "bar",
            data: btmfollowersdata,
            options: {
                onClick: clickLeastFollowersHandler,
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
                        text: "Top 5 Least Amount of Followers",
                    },
                },
            },
        };

        let lFollowersChart = new Chart(chartHolderHTML, LeastFollowersChartconfig);
        function clickLeastFollowersHandler(evt) {
            const points = lFollowersChart.getElementsAtEventForMode(
                evt,
                "nearest",
                { intersect: true },
                true
            );
        }
    });
}

function drawMostInfluential() {
    d3.json("/static/results/twitter_friendship.json").then(function (data) {
        const top_five = data["top_five"];

        let names = [];
        let noPosts = [];

        for (i = 0; i < top_five.length; i++) {
            names.push(top_five[i].user);
            noPosts.push({
                name: top_five[i].user,
                following: top_five[i].counts,
            });
        }

        var topInfluentialValues = [...noPosts]
            .sort((a, b) => b.following - a.following)
            .slice(0, 5);

        const topInfluentialdata = {
            labels: [
                topInfluentialValues[0].name,
                topInfluentialValues[1].name,
                topInfluentialValues[2].name,
                topInfluentialValues[3].name,
                topInfluentialValues[4].name,
            ],
            datasets: [
                {
                    label: "Top Influential",
                    data: [
                        topInfluentialValues[0].following,
                        topInfluentialValues[1].following,
                        topInfluentialValues[2].following,
                        topInfluentialValues[3].following,
                        topInfluentialValues[4].following,
                    ],
                    borderColor: "#ffb1c1",
                    backgroundColor: "rgba(255, 110, 141, 0.5)",
                },
            ]
        };

        const MostInfluentialChartconfig = {
            type: "bar",
            data: topInfluentialdata,
            options: {
                onClick: clickMostInfluentialHandler,
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
                        text: "Top 5 Most Influential",
                    },
                },
            },
        };

        let mInfluentialChart = new Chart(chartHolderHTML, MostInfluentialChartconfig);
        function clickMostInfluentialHandler(evt) {
            const points = mInfluentialChart.getElementsAtEventForMode(
                evt,
                "nearest",
                { intersect: true },
                true
            );
        }
    });
}

function drawLeastInfluential() {
    d3.json("/static/results/twitter_friendship.json").then(function (data) {
        const bottom_five = data["bottom_five"];

        let names = [];
        let noPosts = [];

        for (i = 0; i < bottom_five.length; i++) {
            names.push(bottom_five[i].user);
            noPosts.push({
                name: bottom_five[i].user,
                following: bottom_five[i].counts,
            });
        }

        var btmInfluentialValues = [...noPosts]
            .sort((a, b) => b.following - a.following)
            .slice(0, 5);

        const btmInfluentialdata = {
            labels: [
                btmInfluentialValues[0].name,
                btmInfluentialValues[1].name,
                btmInfluentialValues[2].name,
                btmInfluentialValues[3].name,
                btmInfluentialValues[4].name,
            ],
            datasets: [
                {
                    label: "Least Influential",
                    data: [
                        btmInfluentialValues[0].following,
                        btmInfluentialValues[1].following,
                        btmInfluentialValues[2].following,
                        btmInfluentialValues[3].following,
                        btmInfluentialValues[4].following,
                    ],
                    borderColor: "#ffb1c1",
                    backgroundColor: "rgba(255, 110, 141, 0.5)",
                },
            ]
        };

        const LeastInfluentialChartconfig = {
            type: "bar",
            data: btmInfluentialdata,
            options: {
                onClick: clickLeastInfluentialHandler,
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
                        text: "Top 5 Most Influential",
                    },
                },
            },
        };

        let lInfluentialChart = new Chart(chartHolderHTML, LeastInfluentialChartconfig);
        function clickLeastInfluentialHandler(evt) {
            const points = lInfluentialChart.getElementsAtEventForMode(
                evt,
                "nearest",
                { intersect: true },
                true
            );
        }
    });
}

drawGraph();
drawPost();
drawMostFollowing();
