// Generate sample data
const sampleData = [
    { age: 40, year: 2018, count: 20 },
    { age: 45, year: 2018, count: 30 },
    { age: 50, year: 2018, count: 25 },
    { age: 55, year: 2018, count: 15 },
    { age: 60, year: 2018, count: 10 },
    { age: 40, year: 2019, count: 15 },
    { age: 45, year: 2019, count: 25 },
    { age: 50, year: 2019, count: 30 },
    { age: 55, year: 2019, count: 20 },
    { age: 60, year: 2019, count: 12 },
];

// Assuming you have the sampleData assigned to the `data` variable
const parsedData = sampleData.map(d => ({
    age: +d.age,
    year: +d.year,
    count: +d.count
}));

// Read the data and compute summary statistics for each specie
d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv").then(function (data) {

    // set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 30, left: 40 };
    const width = 640 - margin.left - margin.right;
    const height = 360 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#graph_year_age")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Build and Show the Y scale
    const y = d3.scaleLinear()
        .domain([3.5, 8]) // Note that here the Y scale is set manually
        .range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    // Build and Show the X scale. It is a band scale like for a boxplot: each group has a dedicated RANGE on the axis. This range has a length of x.bandwidth
    const x = d3.scaleBand()
        .range([0, width])
        .domain(["setosa", "versicolor", "virginica"])
        .padding(0.05); // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Features of the histogram
    const histogram = d3.histogram()
        .domain(y.domain())
        .thresholds(y.ticks(20)) // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
        .value(d => d);

    console.log(data);
    console.log(histogram(data))

    // Compute the binning for each group of the dataset
    const sumstat = Array.from(d3.group(data, d => d.Species), ([key, value]) => {
        const input = value.map(g => g.Sepal_Length);
        const bins = histogram(input);
        return { key, value: bins };
    });

    console.log(sumstat);

    // What is the biggest number of value in a bin? We need it because this value will have a width of 100% of the bandwidth.
    const maxNum = Math.max(...sumstat.map(d => Math.max(...d.value.map(d => d.length))));

    console.log(maxNum);

    // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
    const xNum = d3.scaleLinear()
        .range([0, x.bandwidth()])
        .domain([-maxNum, maxNum]);

    console.log(xNum);

    // Add the shape to this svg!
    svg.selectAll("myViolin")
        .data(sumstat)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x(d.key)},0)`) // Translation on the right to be at the group position
        .append("path")
        .datum(d => d.value) // So now we are working bin per bin
        .style("stroke", "none")
        .style("fill", "#69b3a2")
        .attr("d", d3.area()
            .x0(d => xNum(-d.length))
            .x1(d => xNum(d.length))
            .y(d => y(d.x0))
            .curve(d3.curveCatmullRom) // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
        );
});
