// Load the data
d3.csv("https://raw.githubusercontent.com/LouisDeconinck/cancer-data/main/viz_data/cancer_year.csv").then(function (data) {

    // Group the data: I want to draw one line per group
    // Set the dimensions and margins of the graph
    const margin = { top: 50, right: 20, bottom: 20, left: 60 };
    const width = 560 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create the SVG element
    const svg = d3.select("#graph_year")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "white");

    svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 2 - margin.left)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "1em")
        .text("New cancer cases by year");

    // Convert the count values to numbers
    data.forEach(function (d) {
        d.Count = +d.Count;
    });

    // Create the X axis
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.Year))
        .range([0, width]);

    const xAxis = d3.axisBottom(x)
        .tickFormat(d3.format(".0f"));

    // Create the Y axis
    const y = d3.scaleLinear()
        .domain([0, Math.ceil(d3.max(data, d => +d.Count) / 10000) * 10000])
        .range([height, 0]);

    const area = d3.area()
        .x(d => x(d.Year))
        .y0(height)
        .y1(d => y(d.Count));

    // Add the area with the mask applied
    svg.append("path")
        .datum(data)
        .attr("fill", "#006d77")
        .attr("fill-opacity", 0.5) // Set fill opacity to 0.5
        .attr("d", area);

    // Add the x-axis
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis.ticks(5));

    // Create the line
    const line = d3.line()
        .x(d => x(d.Year))
        .y(d => y(d.Count));

    // Add the line
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#006d77")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add circles to every data point
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.Year))
        .attr("cy", d => y(d.Count))
        .attr("r", 3)
        .attr("fill", "#fff")
        .attr("stroke", "#006d77")
        .attr("stroke-width", 2);

    // Add the y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Append line for hover effect
    svg.append("line")
        .attr("id", "cancer_year_hover_vertical_line_top")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", 0)
        .style("display", "none")
        .style("stroke", "#006d77")
        .style("stroke-width", 1)
        .style("stroke-dasharray", "6, 3");

    svg.append("line")
        .attr("id", "cancer_year_hover_vertical_line_bottom")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", height)
        .style("display", "none")
        .style("stroke", "#006d77")
        .style("stroke-width", 1)
        .style("stroke-dasharray", "6, 3");

    svg.append("line")
        .attr("id", "cancer_year_hover_horizontal_line_left")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", 0)
        .style("display", "none")
        .style("stroke", "#006d77")
        .style("stroke-width", 1)
        .style("stroke-dasharray", "6, 3");

    svg.append("line")
        .attr("id", "cancer_year_hover_horizontal_line_right")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", 0)
        .attr("y2", 0)
        .style("display", "none")
        .style("stroke", "#006d77")
        .style("stroke-width", 1)
        .style("stroke-dasharray", "6, 3");

    svg.append("circle")
        .attr("id", "cancer_year_hover_circle")
        .attr("r", 10)
        .style("fill", "none")
        .style("stroke", "#006d77")
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

        // Set hover line position to x position of closest data point
        d3.select("#cancer_year_hover_vertical_line_top")
            .attr("x1", x(data[index].Year))
            .attr("x2", x(data[index].Year))
            .attr("y2", y(data[index].Count) - 10)
            .style("display", "");

        d3.select("#cancer_year_hover_vertical_line_bottom")
            .attr("x1", x(data[index].Year))
            .attr("x2", x(data[index].Year))
            .attr("y1", y(data[index].Count) + 10)
            .style("display", "");

        d3.select("#cancer_year_hover_horizontal_line_left")
            .attr("x2", x(data[index].Year) - 10)
            .attr("y1", y(data[index].Count))
            .attr("y2", y(data[index].Count))
            .style("display", "");

        d3.select("#cancer_year_hover_horizontal_line_right")
            .attr("x1", x(data[index].Year) + 10)
            .attr("y1", y(data[index].Count))
            .attr("y2", y(data[index].Count))
            .style("display", "");

        // Update circle positions
        d3.select("#cancer_year_hover_circle")
            .attr("cx", x(data[index].Year))
            .attr("cy", y(+data[index].Count))
            .style("display", "");

        d3.select("#cancer_year_mask circle")
            .attr("cx", x(data[index].Year))
            .attr("cy", y(+data[index].Count));
    });
});
