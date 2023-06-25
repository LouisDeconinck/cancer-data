

// Load the data
d3.csv("https://raw.githubusercontent.com/LouisDeconinck/cancer-data/main/viz_data/cancer_year_gender.csv").then(function (data) {

    // Set the dimensions and margins of the graph
    const margin = { top: 50, right: 120, bottom: 20, left: 60 };
    const width = 640 - margin.left - margin.right;
    const height = 360 - margin.top - margin.bottom;

    // Create the SVG element
    const svg = d3.select("#graph_year_gender")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "white");

    svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 2 - margin.left)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "1em")
        .text("New cancer cases by year by gender");

    const maleData = data.filter(d => d.Gender === "Male");
    const femaleData = data.filter(d => d.Gender === "Female");

    // Group the data: I want to draw one line per group
    const sumstat = Array.from(d3.group(data, d => d.Gender))
        .sort((a, b) => {
            const order = ["Male", "Female"];
            return order.indexOf(a[0]) - order.indexOf(b[0]);
        });

    // Create the X axis
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.Year))
        .range([0, width]);

    const xAxis = d3.axisBottom(x)
        .tickFormat(d3.format(".0f"));

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis.ticks(5));

    // Create the Y axis
    const y = d3.scaleLinear()
        .domain([26000, Math.ceil(d3.max(data, d => +d.Count) / 1000) * 1000])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add horizontal gridlines
    svg.append("g")
        .attr("id", "grid")
        .selectAll("line")
        .data(y.ticks())
        .join("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d))
        .attr("stroke", "lightgray")
        .attr("opacity", 0.5);

    // Create the color palette
    const color = d3.scaleOrdinal()
        .domain(["Male", "Female"])
        .range(['#023e8a', '#f72585']);

    // Create a group for male data
    const maleGroup = svg.append("g")
        .attr("class", "male-group");

    // Draw the lines for male data
    maleGroup.append("path")
        .attr("fill", "none")
        .attr("stroke", color.range()[0])
        .attr("stroke-width", 3)
        .attr("d", d3.line()
            .x(d => x(d.Year))
            .y(d => y(+d.Count))
            (maleData));

    // Add circles for male data
    maleGroup.selectAll(".male-circle")
        .data(maleData)
        .join("circle")
        .attr("class", "male-circle")
        .attr("cx", d => x(d.Year))
        .attr("cy", d => y(d.Count))
        .attr("r", 3)
        .attr("fill", color.range()[0]);

    // Create a group for female data
    const femaleGroup = svg.append("g")
        .attr("class", "female-group");

    // Draw the lines for female data
    femaleGroup.append("path")
        .attr("fill", "none")
        .attr("stroke", color.range()[1])
        .attr("stroke-width", 3)
        .attr("d", d3.line()
            .x(d => x(d.Year))
            .y(d => y(+d.Count))
            (femaleData));

    // Add circles for female data
    femaleGroup.selectAll(".female-circle")
        .data(femaleData)
        .join("circle")
        .attr("class", "female-circle")
        .attr("cx", d => x(d.Year))
        .attr("cy", d => y(d.Count))
        .attr("r", 3)
        .attr("fill", color.range()[1]);

    // Add legend group
    const legendGroup = svg.append("g")
        .attr("class", "legend-group")
        .attr("transform", "translate(410, 200)");

    // Add legend circles
    const legendCircles = legendGroup.selectAll("circle")
        .data(sumstat)
        .join("circle")
        .attr("cx", 0)
        .attr("cy", (d, i) => i * 25)
        .attr("r", 7)
        .style("fill", d => color(d[0]));

    // Add legend text labels
    const legendLabels = legendGroup.selectAll("text")
        .data(sumstat)
        .join("text")
        .attr("x", 20)
        .attr("y", (d, i) => i * 25)
        .style("fill", d => color(d[0]))
        .text(d => d[0])
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");

    // Append line for hover effect
    svg.append("line")
        .attr("class", "hover-line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", height)
        .style("display", "none")
        .style("stroke", "darkgray")
        .style("stroke-width", 1)
        .style("stroke-dasharray", "6, 3");

    svg.append("g")
        .attr("id", "tooltip")
        .attr("transform", "translate(400, 10)")
        .style("display", "none");

    svg.select("#tooltip")
        .append("rect")
        .attr("width", 95)
        .attr("height", 75)
        .attr("fill", "darkgrey")
        .attr("rx", 5)
        .attr("ry", 5);

    svg.select("#tooltip")
        .append("text");

    // Append circle for hover effect on male data point
    svg.append("circle")
        .attr("class", "hover-circle-male")
        .attr("r", 10)
        .style("fill", "none")
        .style("stroke", "darkgray")
        .style("stroke-width", 2)
        .style("stroke-dasharray", "4 4")
        .style("display", "none");

    // Append circle for hover effect on female data point
    svg.append("circle")
        .attr("class", "hover-circle-female")
        .attr("r", 10)
        .style("fill", "none")
        .style("stroke", "darkgray")
        .style("stroke-width", 2)
        .style("stroke-dasharray", "4 4")
        .style("display", "none");

    // Define bisector function to find index of closest data point
    const bisect = d3.bisector(d => d.Year).center;

    // Add mousemove event to SVG element
    svg.on("mousemove", function () {
        // Get mouse coordinates relative to SVG element
        const [mouseX, mouseY] = d3.pointer(event);

        // Find index of closest data point
        let index = bisect(data, x.invert(mouseX));
        if (index % 2 === 1) {
            index = index - 1;
        }

        // Set hover line position to x position of closest data point
        d3.select(".hover-line")
            .attr("x1", x(data[index].Year))
            .attr("x2", x(data[index].Year))
            .style("display", "");

        const femaleCount = +data[index].Count;
        const maleCount = +data[index + 1].Count;

        // Update tooltip content
        d3.select("#tooltip text")
            .attr("fill", "white")
            .html(`<tspan x="10" y="25" font-weight="bold">${data[index].Year}</tspan>\n
      <tspan x="10"  dy="1.2em">M: ${maleCount.toLocaleString()}</tspan>\n
      <tspan x="10"  dy="1.2em">F: ${femaleCount.toLocaleString()}</tspan>`);

        // Update tooltip position
        d3.select("#tooltip")
            .style("display", "");

        // Update circle positions
        d3.select(".hover-circle-male")
            .attr("cx", x(data[index].Year))
            .attr("cy", y(maleCount))
            .style("display", "");

        d3.select(".hover-circle-female")
            .attr("cx", x(data[index].Year))
            .attr("cy", y(femaleCount))
            .style("display", "");
    });

});