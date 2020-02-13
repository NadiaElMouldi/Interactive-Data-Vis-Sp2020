// data load
// reference for d3.autotype: https://github.com/d3/d3-dsv#autoType
d3.csv("../data/TNElectData.csv", d3.autoType).then(data => {
    console.log(data);
  
    /** CONSTANTS */
    // constants help us reference the same values throughout our code
    const width = window.innerWidth * 0.9,
      height = window.innerHeight / 2,
      paddingInner = 0.2,
      margin = { top: 20, bottom: 40, left: 40, right: 40 };
  
    /** SCALES */
    // reference for d3.scales: https://github.com/d3/d3-scale
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.Votes)])
      .range([margin.left, width-margin.right]);
  
    const yScale = d3
      .scaleBand()
      .domain(data.map(d =>d.Candidate))
      .range([height - margin.bottom,0])
      .paddingInner(paddingInner);

    const colorScale = d3.scaleLinear().domain([0, d3.max(data, d => d.Votes)]).range(["beige","red"])

    console.log(colorScale)
  
    // reference for d3.axis: https://github.com/d3/d3-axis
    const xAxis = d3.axisBottom(xScale).ticks(data.length);
    const yAxis = d3.axisLeft(yScale).ticks(data.length);
    
  
    /** MAIN CODE */
    const svg = d3
      .select("#d3-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    // append rects
    const rect = svg
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("y", d => yScale(d.Candidate))
      .attr("x", d => 2*margin.left)
      .attr("width", d => xScale(d.Votes)-margin.left)
      .attr("height", yScale.bandwidth())
      .attr("fill", "steelblue")
      .attr("fill", d =>  colorScale(d.Votes))
  
    // append text
    const text = svg
      .selectAll("text")
      .data(data)
      .join("text")
      .attr("class", "label")
      // this allows us to position the text in the center of the bar
      .attr("x", d => xScale(d.Votes))
      .attr("y", d => yScale(d.Candidate)+(yScale.bandwidth()/2))
      .text(d => d.Votes)
      .attr("dx", "1.25em");
  
    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${2*margin.top}, ${height - margin.bottom})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${2*margin.left},0)`)
      .call(yAxis)
});