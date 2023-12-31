// Load the CSV file
d3.csv("https://raw.githubusercontent.com/LouisDeconinck/cancer-data/main/viz_data/cancer_age.csv").then(function (data) {
    // Convert count values to numbers
    data.forEach(function (d) {
        d.Count = +d.Count;
    });

    // Sort the data based on age
    data.sort(function (a, b) {
        var lowerAgeA = getLowerAgeLimit(a.Age);
        var lowerAgeB = getLowerAgeLimit(b.Age);
        return d3.ascending(lowerAgeA, lowerAgeB);
    });

    // Function to extract the lower age limit from age range
    function getLowerAgeLimit(ageRange) {
        if (ageRange === "> 85") {
            return 100; // Assign a large value for sorting purposes
        }
        return +ageRange.split(" - ")[0];
    }

    // Group data below 30 into a single bar labeled "< 30"
    var groupedData = [];
    var count = 0;
    for (var i = 0; i < data.length; i++) {
        var lowerAge = getLowerAgeLimit(data[i].Age);
        if (lowerAge < 30) {
            count += data[i].Count;
        } else {
            groupedData.push({ Age: data[i].Age, Count: data[i].Count });
        }
    }
    groupedData.unshift({ Age: "< 30", Count: count });

    // Set up the dimensions and margins of the plot
    const margin = { top: 50, right: 20, bottom: 40, left: 60 };
    const width = 640 - margin.left - margin.right;
    const height = 360 - margin.top - margin.bottom;

    // Create the SVG element
    const svg = d3.select("#graph_age")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define the x and y scales
    const x = d3.scaleBand()
        .domain(groupedData.map(function (d) { return d.Age; }))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, Math.ceil(d3.max(groupedData, d => +d.Count) / 1000) * 1000])
        .range([height, 0]);

    // Create the bars
    svg.selectAll(".bar")
        .data(groupedData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .style("fill", "#006d77")
        .attr("x", function (d) { return x(d.Age); })
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
        .text("New cancer cases by age in 2020");

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 30)
        .attr("text-anchor", "middle")
        .attr('font-size', '0.8em')
        .text("Age");

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