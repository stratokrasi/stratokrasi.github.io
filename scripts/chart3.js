// Function to load data and generate the scatterplot
async function loadScatterPlot() {
    data = await d3.csv("data/us_births_2016_2021.csv")

    let yearVal = document.getElementById("year")
    let eduLvlVal = document.getElementById("eduLvlList")

    if(yearVal != null) {
        yearVal = yearVal.value
        if(yearVal != "0") {
            yearVal = 2016 + parseInt(yearVal) - 1
            data = filterDataByYear(data, yearVal.toString())
        }
    }
    if(eduLvlVal != null) {
        eduLvlVal = eduLvlVal.value
        if(eduLvlVal != "0") {
            data = filterDataByEduLvl(data, eduLvlVal)
        }
    }

    // Select the container div for the scatterplot
    const chartContainer = d3.select("#chart3");
    chartContainer.html("")
    chartContainer.selectAll("svg").remove()

    // Create an SVG element within the container
    const svg = chartContainer
        .append("svg")
        .attr("width", "700")
        .attr("height", "700");

    // Convert data types if necessary
    data.forEach((d) => {
        d.Average_Age_of_Mother = +d.Average_Age_of_Mother; // Convert value to number
        d.Average_Birth_Weight = +d.Average_Birth_Weight; // Convert value to number
    });

    // Set up scales
    const xScale = d3.scaleLinear()
        .domain([19, 37])
        .range([0, 700]);

    const yScale = d3.scaleLinear()
        .domain([2300, 3750])
        .range([700, 0]);

    // Create circles for the scatter plot
    svg
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d.Average_Age_of_Mother))
        .attr("cy", (d) => yScale(d.Average_Birth_Weight))
        .attr("r", 3)
        .attr("fill", (d) => edu_lvl_code_to_color.get(d.Education_Level_Code));

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    svg
        .append("g")
        .attr("transform", "translate(0, 630)")
        .call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    svg.append("g")
        .attr("transform", "translate(70, 0)")
        .call(yAxis);

    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", 500)
        .attr("y", 670)
        .text("Average Age of Mother (Years)");

    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", -300) // positioning from the top
        .attr("y", 10) // positioning from the left
        .attr("transform", "rotate(-90)")
        .text("Average Birth Weight (g)");
}
