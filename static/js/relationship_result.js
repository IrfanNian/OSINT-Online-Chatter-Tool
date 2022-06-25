const width = window.innerWidth
const height = window.innerHeight

const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height)

d3.json('/static/results/twitter_friendship.json').then(function(data) {
    const nodes = data['nodes'];
    const links = data['links'];

    const simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(-100))
        .force('center', d3.forceCenter(width / 2, height / 2))

    const nodeElements = svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
            .attr('r', 10)
            .attr('fill', "black")

    const textElements = svg.append('g')
        .selectAll('text')
        .data(nodes)
        .enter().append('text')
            .text(node => node.user)
            .attr('font-size', 10)
            .attr('dx', 15)
            .attr('dy', 4)

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
    })

    simulation.force('link', d3.forceLink(links)
        .id(function(d) { return d.user }).distance(200))

    const linkElements = svg.append('g')
        .selectAll('line')
        .data(links)
        .enter().append('line')
            .attr('stroke-width', function(d) { return d.value; })
            .attr('stroke', "black")

    simulation.force('link').links(links)

    function handleZoom(e) {
        d3.selectAll('svg g')
            .attr('transform', e.transform)
    }

    const zoom = d3.zoom()
        .on('zoom', handleZoom)

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
                neighbors.push(links.source)
            }
            else if (links.source.user === node.target.__data__.user) {
                neighbors.push(links.target)
            }
            return neighbors
        }, [node.target.__data__.user])
    }

    function appendNeighbors(node, neighbors) {
        if (neighbors.indexOf(node.user) == 0) {
            for (let i = 1; i < neighbors.length-1; i++) {
                console.log(neighbors[i].user)
            }
        }
    }

    function getNodeAndColor(node, neighborArray) {
        if (neighborArray.includes(node.user)) {
            return 'blue'
        }
    }

    function isNeighborLink(node, link) {
        return link.target.user === node.target.__data__.user || link.source.user === node.target.__data__.user
    }

    function getLinkAndColor(node, link) {
        return isNeighborLink(node, link) ? 'blue' : 'black'
    }

    function selectNode(selectedNode) {
        const neighborArray = []
        const neighbors = getNeighbors(selectedNode)

        for (let i = 0; i < neighbors.length; i++) {
            if (i == 0) {
                neighborArray.push(neighbors[0])
            }
            neighborArray.push(neighbors[i].user)
        }
        nodeElements
            .attr('fill', node => getNodeAndColor(node, neighborArray))
        textElements
            .attr('fill', node => getNodeAndColor(node, neighborArray))
        linkElements
            .attr('stroke', link => getLinkAndColor(selectedNode, link))
    }
});