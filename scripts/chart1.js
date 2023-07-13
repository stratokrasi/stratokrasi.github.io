async function loadGeoMap() {

    statesFile = await d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")

    stateNames = await d3.tsv("data/us-state-names.tsv")

    data = await d3.csv("data/us_births_2016_2021.csv")
    processedDataForGeo = processData(data)

    var stateCodeToBirths = {};
    processedDataForGeo.names.forEach(function (d, i) {
        stateCodeToBirths[d] = processedDataForGeo.totals[i];
    });

    var stateCodes = {};
    stateNames.forEach(function (d, i) {
        stateCodes[d.id] = d.code;
    });

    const chartContainer = d3.select("#chart1");
    chartContainer.html("")
    chartContainer.selectAll("svg").remove()

    // Create an SVG element within the container

    width = 1000
    height = 800

    const svg = chartContainer
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    usStates = topojson.feature(statesFile, statesFile.objects.states)


    const projection = d3.geoAlbersUsa().fitSize([width, height], usStates);
    const geopathGenerator = d3.geoPath().projection(projection);
    var path = geopathGenerator(usStates)

    console.log(d3.extent(processedDataForGeo.totals))

    colorScale = d3.scaleQuantize()
        .domain(d3.extent(processedDataForGeo.totals))
        .range(['royalblue', 'lightblue', 'turquoise', 'green', 'lightgreen', 'yellow', 'orange', 'red', 'darkred'])

    svg.append("g")
        .selectAll("path")
        .data(usStates.features)
        .enter()
        .append("path")
        .attr("d", geopathGenerator)
        .style("stroke", "black")
        .style("fill", d => {
            return colorScale(stateCodeToBirths[stateCodes[parseInt(d.id)]])
        })
        .on("pointerenter pointermove", function (event, d) {
            const numBirths = stateCodeToBirths[stateCodes[parseInt(d.id)]];
            const name = d.properties.name;
            const [x, y] = d3.pointer(event);
            tooltip
                .attr('transform', `translate(${x},${y})`)
                .call(callout, `State: ${name}\n# of Births: ${numBirths}`);
        })
        .on('pointerleave', () => tooltip.call(callout, null));

    const tooltip = svg.append("g")
        .style("pointer-events", "none");
}

callout = (g, value) => {
    if (!value) return g.style("display", "auto");

    g
        .style("display", null)
        .style("pointer-events", "auto")
        .style("font", "10px sans-serif");

    const path = g.selectAll("path")
        .data([null])
        .join("path")
        .attr("fill", "white")
        .attr("stroke", "black");

    const text = g.selectAll("text")
        .data([null])
        .join("text")
        .call(text => text
            .selectAll("tspan")
            .data((value + "").split(/\n/))
            .join("tspan")
            .attr("x", 0)
            .attr("y", (d, i) => `${i * 1.1}em`)
            .style("font-weight", (_, i) => i ? null : "bold")
            .html(function (d) {
                return d
            }));

    const { x, y, width: w, height: h } = text.node().getBBox(); // the box that our text is in
    // place the text
    text.attr("transform", `translate(${-w / 2},${15 - y})`);
    path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
}