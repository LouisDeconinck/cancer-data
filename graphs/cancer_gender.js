d3.csv("https://raw.githubusercontent.com/LouisDeconinck/cancer-data/main/viz_data/cancer_gender.csv").then(function (data) {

    const margin = { top: 50, right: 0, bottom: 20, left: 0 };
    const width = 640 - margin.left - margin.right;
    const height = 360 - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;

    // Define the color scale
    const color = d3.scaleOrdinal()
        .domain(["Male", "Female"])
        .range(['#023e8a', '#f72585']);

    // Define the arc generator
    const arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    // Define the pie generator
    const pie = d3.pie()
        .sort(null)
        .value(d => d.Count);

    // Create the SVG element
    const svg = d3.select('#graph_gender')
        .append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2 + margin.top})`);

    svg.append("text")
        .attr("x", 0)
        .attr("y", -height / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "1em")
        .text("New cancer cases by gender in 2020");

    // Create the pie slices
    const g = svg.selectAll('.arc')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'arc');

    // Draw the pie slices
    g.append('path')
        .attr('d', arc)
        .style('fill', d => color(d.data.Gender));

    // Add the labels
    g.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .html(d => {
            const count = +d.data.Count;
            return `<tspan font-weight="bold">${d.data.Gender}</tspan>\n
            <tspan x="0" dy="1.5em" font-size="0.8em">
                ${count.toLocaleString()} (${((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1)}%)
            </tspan>`;
        });
});