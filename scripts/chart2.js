async function loadBarChart() {
    data = await d3.csv("data/us_births_2016_2021.csv")

    let yearVal = document.getElementById("year2")
    if (yearVal != null) {
        yearVal = yearVal.value
        if (yearVal != "0") {
            yearVal = 2016 + parseInt(yearVal) - 1
            data = filterDataByYear(data, yearVal.toString())
        }
    }

    const chartContainer = d3.select("#chart2");
    chartContainer.html("")
    chartContainer.selectAll("svg").remove()

    // Create an SVG element within the container

    width = 700
    height = 700

    var svg = chartContainer
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var dataP = processData(data)

    margin = ({ top: 10, right: 10, bottom: 20, left: 40 })

    var yScale = d3.scaleBand()
        .domain(dataP.names)
        .range([margin.top, height - margin.bottom])
        .padding([0.1]);

    var xScale = d3.scaleLinear()
        .domain([0, d3.max(dataP.totals)])
        .rangeRound([margin.left, width - margin.right]);


    // Add axes
    svg
        .append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).tickSizeOuter(0));

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("~s")));

    svg.append("g")
        .selectAll("g")
        .data(dataP)
        .enter().append("g")
        .attr("fill", (d, i) => edu_lvl_code_to_color.get(dataP.keys[i]))
        .selectAll("rect")
        .data(d => d)
        .enter().append("rect")
        .attr("x", d => xScale(d[0]))
        .attr("y", (d, i) => yScale(dataP.names[i]))
        .attr("height", yScale.bandwidth())
        .attr("width", d => xScale(d[1]) - xScale(d[0]))
        .attr("transform", "translate(1,0)"); // hack to move chart by 1 pixel

    addAnnotation(svg, dataP.names[2], dataP.totals[2])
}

function addAnnotation(svg, thirdState, thirdPopulation) {
    const annotations = [
        {
          note: {
            label: "Women with only a high school diploma in high population states had the most children.",
            title: "CA, TX"
          },
          type: d3.annotationCalloutCircle,
          subject: {
            radius: 14,
            radiusPadding: 0
          },
          color: ["grey"],
          x: 200,
          y: 23,
          dy: 80,
          dx: 180
        },
        {
            note: {
              label: `${thirdPopulation} total births. From 2020-2021, FL has overtaken NY as the state with the 3rd most births.`,
              title: `${thirdState}`
            },
            color: ["red"],
            x: 120,
            y: 45,
            dy: 100,
            dx: 100
          }
      ]
      
      // Add annotation to the chart
      const makeAnnotations = d3.annotation()
        .annotations(annotations)
      svg
        .append("g")
        .call(makeAnnotations)
      
}