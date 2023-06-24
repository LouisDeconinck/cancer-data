// Load the CSV file
d3.csv("https://raw.githubusercontent.com/LouisDeconinck/cancer-data/main/viz_data/cancer_type.csv").then(function (data) {
    // Convert count values to numbers
    data.forEach(function (d) {
        d.Count = +d.Count;
    });

    // Replace names
    data.forEach(function (d) {
        if (d.Name === "Malignant neoplasms of skin") {
            d.Name = "Skin";
        } else if (d.Name === "Bronchus and lung") {
            d.Name = "Lung";
        } else if (d.Name === "Melanoma of skin") {
            d.Name = "Melanoma";
        } else if (d.Name === "Non-Hodgkin-lymphoma") {
            d.Name = "Lymphoma";
        }
    });

    const otherData = data.slice(11);
    // Sort the data by count in descending order and take the top 10
    data = data.sort(function (a, b) {
        return d3.descending(a.Count, b.Count);
    }).slice(0, 11);

    // Group all types with a count less than the 10th type in a separate category called "Other"
    const otherCount = d3.sum(otherData.slice(10), function (d) {
        return d.Count;
    });

    data.push({ Name: "Other", Count: otherCount });

    // Abbreviate type names to a maximum of 6 characters
    data.forEach(function (d) {
        d.Name = d.Name.slice(0, 8) + (d.Name.length > 8 ? "." : "");
    });

    // Set up the dimensions and margins of the plot
    const margin = { top: 50, right: 20, bottom: 40, left: 60 };
    const width = 560 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create the SVG element
    const svg = d3.select("#graph_type")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define the x and y scales
    const x = d3.scaleBand()
        .domain(data.map(function (d) { return d.Name; }))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, Math.ceil(d3.max(data, d => +d.Count) / 20000) * 20000])
        .range([height, 0]);

    // Create the bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .style("fill", "#006d77")
        .attr("x", function (d) { return x(d.Name); })
        .attr("width", x.bandwidth())
        .attr("y", function (d) { return y(d.Count); })
        .attr("height", function (d) { return height - y(d.Count); });

    // Add x-axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text("New cancer cases by type in 2020");

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 30)
        .attr("text-anchor", "middle")
        .attr('font-size', '0.8em')
        .text("Type");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", -margin.left)
        .attr("dy", "1em")
        .attr("font-size", "0.8em")
        .attr("text-anchor", "middle")
        .text("Count");
})