/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 5;
  default_selection = "Select an Area"

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;
let colorScale;

/* APPLICATION STATE */
let state = {
  data: [],
  selection: null, // + YOUR FILTER SELECTION
  check: "off",
  selection_stack: null
};

/* LOAD DATA */
// + SET YOUR DATA PATH
d3.csv("../../data/homeless_pop.csv", d => ({
  year: new Date(d.Year, 0, 1),
  area: d.Area,
  count: +d.Homeless_Estimates
})
).then(raw_data => {
  console.log("raw_data", raw_data);
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  // + SCALES

  xScale = d3.scaleTime()
    .domain(d3.extent(state.data, d => d.year))
    .range([margin.left, width - margin.right])

  yScale = d3.scaleLinear()
    .domain([0,d3.max(state.data, d => d.count)])
    .range([height - margin.bottom, margin.top])

  

  // + AXES

  xAxis = d3.axisBottom(xScale)
  yAxis = d3.axisLeft(yScale)

  // + UI ELEMENT SETUP

  const selectElement = d3.select("#dropdown").on("change", function () {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected
    state.selection = this.value; // + UPDATE STATE WITH YOUR SELECTED VALUE
    console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
  });


  const selectElement_stack = d3.select("#dropdown2").on("change", function () {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected
    state.selection_stack = this.value; // + UPDATE STATE WITH YOUR SELECTED VALUE
    console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
  });

  const checked = d3.select("#checkbox").on("change", function () {
    state.check = this.value;
    console.log("checked is", this.value);
    draw()
  })

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data(Array.from(new Set(state.data.map(d => d.area)))) // + ADD DATA VALUES FOR DROPDOWN
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  selectElement_stack
    .selectAll("option")
    .data(["Stack Areas","Do Not Stack Areas"])
    .join("option")
    .attr("value", d => d)
    .text(d => d)

  // + SET SELECT ELEMENT'S DEFAULT VALUE (optional)

  selectElement.property("value", default_selection);
  selectElement_stack.property("value", "Do Not Stack Areas")

  // + CREATE SVG ELEMENT
  svg = d3.select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)


  // + CALL AXES

 svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dy", "3em")
    .text("Year");

  
    svg.append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .append("text")
    .attr("class","axis-label")
    .attr("y", "50%")
    .attr("dx","-3em")
    .attr("writing-mode", "vertical-rl")
    .text("Count")


    draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {
  // + FILTER DATA BASED ON STATE
  let filteredData;
  if (state.select != "All") {
    filteredData = state.data.filter(d => d.area === state.selection)
  }
  //
  // + UPDATE SCALE(S), if needed
  //
  // + UPDATE AXIS/AXES, if needed
  //
  // + DRAW CIRCLES, if you decide to
  // const dot = svg
  //   .selectAll("circle")
  //   .data(filteredData, d => d.name)
  //   .join(
  //     enter => enter, // + HANDLE ENTER SELECTION
  //     update => update, // + HANDLE UPDATE SELECTION
  //     exit => exit // + HANDLE EXIT SELECTION
  //   );
  //
  // + DRAW LINE AND AREA
  // const lineFunction = d3.line()
  // .x(d => xScale(d.year))
  // .y(d => yScale(d.count));

  colorScale = d3.scaleLinear().domain([0, d3.max(state.data, d => d.area)]).range(["beige","blue"])
  const area = d3.area()
  .x(d => xScale(d.year))
  .y0(height-margin.bottom)
  .y1(d => yScale(d.count))
  if (state.selection_stack == "Stack Areas") {
    console.log("on")
    line = svg.selectAll("path.line")
    .data([filteredData])
    .join(
      enter => 
        enter
          .append("path")
          .attr("class", "area")
          .attr("opacity",0),
      update => update,
      exit => exit.remove()
    )
  }
  else{
    console.log("not on")
    line = svg.selectAll("path.area")
    .data([filteredData])
    .join(
      enter => 
        enter
          .append("path")
          .attr("class", "area")
          .attr("opacity",0),
      update => update,
      exit => exit.remove()
    )
  }


  line.call(selection =>
      selection
        .transition()
        .duration(1000)
        .attr("opacity",0.3)
        .attr("d", d => area(d)))
}
