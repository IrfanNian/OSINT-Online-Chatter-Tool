const width = window.innerWidth;
const height = window.innerHeight;
let resetButton = document.getElementById("reset_graph");
let topFive = document.getElementById("top_five");
let btmFive = document.getElementById("bottom_five");
let mostFollowing = document.getElementById("most_following");
let mostFollower = document.getElementById("most_follower");
let leastFollowing = document.getElementById("least_following");
let leastFollower = document.getElementById("least_follower");
let parent = document.getElementById("parent");
let following = document.getElementById("following");
let followers = document.getElementById("followers");

resetButton.addEventListener("click", function () {
    d3.selectAll("svg > *").remove();
    parent.textContent = "";
    following.textContent = "";
    followers.textContent = "";
    drawGraph();
});

const svg = d3.select("svg").attr("width", width).attr("height", height);

function drawGraph() {
    d3.json("/static/results/twitter_friendship.json").then(function (data) {
        const nodes = data["nodes"];
        const links = data["links"];
        const level = data["level"];
        const users = data["users"];
        const top_five = data["top_five"];
        const bottom_five = data["bottom_five"];
        const searched_user = data["searched_user"];
        document.title = searched_user;
        const most_following = data["most_following"];
        const most_follower = data["most_follower"];
        const least_following = data["least_following"];
        const least_follower = data["least_follower"];
        document.getElementById("query").textContent =
            searched_user + " | Level: " + level + " | Users: " + users;
        let topFive_paragraph = "Top 5 Most Influential User(s): ";
        let bottomFive_paragraph = "Top 5 Least Influential User(s): ";
        let most_following_paragraph = "Top 5 Most Amount of Following(s): ";
        let most_follower_paragraph = "Top 5 Most Amount of Follower(s): ";
        let least_following_paragraph = "Top 5 Least Amount of Following(s): ";
        let least_follower_paragraph = "Top 5 Least Amount of Follower(s): ";
        for (let i = 0; i < most_following.length; i++) {
            most_following_paragraph +=
                most_following[i].user + "(" + most_following[i].counts + ")";
            if (i < most_following.length - 2) {
                most_following_paragraph += ", ";
            } else if (i == most_following.length - 2) {
                most_following_paragraph += " and ";
            }
        }
        for (let i = 0; i < most_follower.length; i++) {
            most_follower_paragraph +=
                most_follower[i].user + "(" + most_follower[i].counts + ")";
            if (i < most_follower.length - 2) {
                most_follower_paragraph += ", ";
            } else if (i == most_follower.length - 2) {
                most_follower_paragraph += " and ";
            }
        }
        for (let i = 0; i < least_following.length; i++) {
            least_following_paragraph +=
                least_following[i].user + "(" + least_following[i].counts + ")";
            if (i < least_following.length - 2) {
                least_following_paragraph += ", ";
            } else if (i == least_following.length - 2) {
                least_following_paragraph += " and ";
            }
        }
        for (let i = 0; i < least_follower.length; i++) {
            least_follower_paragraph +=
                least_follower[i].user + "(" + least_follower[i].counts + ")";
            if (i < least_follower.length - 2) {
                least_follower_paragraph += ", ";
            } else if (i == least_follower.length - 2) {
                least_follower_paragraph += " and ";
            }
        }
        for (let i = 0; i < top_five.length; i++) {
            topFive_paragraph +=
                top_five[i].user + "(" + top_five[i].counts + ")";
            if (i < top_five.length - 2) {
                topFive_paragraph += ", ";
            } else if (i == top_five.length - 2) {
                topFive_paragraph += " and ";
            }
        }
        for (let i = 0; i < bottom_five.length; i++) {
            bottomFive_paragraph +=
                bottom_five[i].user + "(" + bottom_five[i].counts + ")";
            if (i < bottom_five.length - 2) {
                bottomFive_paragraph += ", ";
            } else if (i == bottom_five.length - 2) {
                bottomFive_paragraph += " and ";
            }
        }
        topFive.textContent = topFive_paragraph;
        btmFive.textContent = bottomFive_paragraph;
        mostFollowing.textContent = most_following_paragraph;
        mostFollower.textContent = most_follower_paragraph;
        leastFollowing.textContent = least_following_paragraph;
        leastFollower.textContent = least_follower_paragraph;

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

        const zoom = d3.zoom().on("zoom", handleZoom);

        d3.select("svg").call(zoom);

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
drawGraph();
