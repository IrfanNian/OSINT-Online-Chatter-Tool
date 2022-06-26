const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height);

d3.json('/static/results/twitter_friendship.json').then(function(data) {
    const nodes = data['nodes'];
    const links = data['links'];
    const level = data['level'];

    document.getElementById("query").textContent += " | Level: " + level;

    const simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(-100))
        .force('center', d3.forceCenter(width / 2, height / 2));

    const nodeElements = svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
            .attr('r', 20)
            .attr('fill', "black");

    const textElements = svg.append('g')
        .selectAll('text')
        .data(nodes)
        .enter().append('text')
            .text(node => node.user)
            .attr('font-size', 10)
            .attr('dx', 25)
            .attr('dy', 4);

    simulation.nodes(nodes).on('tick', () => {
        nodeElements
            .attr('cx', node => node.x)
            .attr('cy', node => node.y)
            .call(drag)
            .on('click', selectNode)
        textElements
            .attr('x', node => node.x)
            .attr('y', node => node.y)
        linkElements
            .attr('x1', link => link.source.x)
            .attr('y1', link => link.source.y)
            .attr('x2', link => link.target.x)
            .attr('y2', link => link.target.y)
    });

    simulation.force('link', d3.forceLink(links)
        .id(function(d) { return d.user }).distance(200));

    const linkElements = svg.append('g')
        .selectAll('line')
        .data(links)
        .enter().append('line')
            .attr('stroke-width', function(d) { return d.value; })
            .attr('stroke', "black");

    simulation.force('link').links(links);

    function handleZoom(e) {
        d3.selectAll('svg g')
            .attr('transform', e.transform);
    }

    const zoom = d3.zoom()
        .on('zoom', handleZoom);

    d3.select('svg')
        .call(zoom);

    const drag = d3.drag()
        .on('start', drag_start)
        .on('drag', drag_drag)
        .on('end', drag_end);

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
        return links.reduce((neighbors, links) => {
            if (links.target.user === node.target.__data__.user) {
                neighbors.push(links.source);
            }
            else if (links.source.user === node.target.__data__.user) {
                neighbors.push(links.target);
            }
            return neighbors;
        }, [node.target.__data__.user])
    }

    function getNeighborsAndLinks(node) {
        return links.reduce((neighbors, links) => {
            if (links.target.user === node.target.__data__.user) {
                let obj = links.source;
                obj.link = links.value
                neighbors.push(obj);
            }
            else if (links.source.user === node.target.__data__.user) {
                let obj = links.target;
                obj.link = links.value
                neighbors.push(obj);
            }
            return neighbors;
        }, [node.target.__data__.user])
    }

    function getNodeAndColor(node, neighborArray) {
        if (neighborArray.includes(node.user)) {
            return 'red';
        }
    }

    function isNeighborLink(node, link) {
        return link.target.user === node.target.__data__.user || link.source.user === node.target.__data__.user;
    }

    function getLinkAndColor(node, link) {
        return isNeighborLink(node, link) ? 'red' : 'black';
    }

    function displayNeighbors(neighbors) {
        document.getElementById("information").removeAttribute("hidden");
        let parent = document.getElementById("parent");
        let following = document.getElementById("following");
        let followers = document.getElementById("followers");
        parent_paragraph = "You have selected: " + neighbors[0].user;
        follows_paragraph = neighbors[0].user + " follow(s): ";
        followers_paragraph = neighbors[0].user + " follower(s): ";
        for (let i = 0; i < neighbors.length; i++) {
            if (i == 0) {
                i += 1;
            }
            follows_paragraph += neighbors[i].user
            if (i < neighbors.length - 2) {
                follows_paragraph += ", ";
            }
            else if (i == neighbors.length - 2) {
                follows_paragraph += " and ";
            }
        }
        if (neighbors.some(e => e.link === 3)) {
            for (let i = 0; i < neighbors.length; i++) {
                if (i == 0) {
                    i += 1;
                }
                if (neighbors[i].link == 3) {
                    followers_paragraph += neighbors[i].user;
                    if (i < neighbors.length - 2) {
                        followers_paragraph += ", ";
                    }
                    else if (i == neighbors.length - 2) {
                        followers_paragraph += " and ";
                    }
                }
            }
        }
        else {
            followers_paragraph += " None"
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
                neighborArray.push(neighbors[0])
                i += 1;
            }
            neighborArray.push(neighbors[i].user);
        }

        for (let i = 0; i < neighborsAndLinks.length; i++) {
            if (i == 0) {
                neighborAndLinksArray.push({user: neighborsAndLinks[0]})
                i += 1;
            }
            neighborAndLinksArray.push(neighborsAndLinks[i]);
        }
        let uniqueNeighborArray = [...new Set(neighborArray)]
        let uniqueNeighborAndLinksArray = [...new Map(neighborAndLinksArray.map(item => [item['user'], item])).values()]
        displayNeighbors(uniqueNeighborAndLinksArray);

        nodeElements
            .attr('fill', node => getNodeAndColor(node, neighborArray))
        textElements
            .attr('fill', node => getNodeAndColor(node, neighborArray))
        linkElements
            .attr('stroke', link => getLinkAndColor(selectedNode, link))
    }
});