/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 5;

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;

/* APPLICATION STATE */
let state = {
  data: [],
  countries: ["All"],
  gender_i: ["All", "Low Women Civil Liberties Index", "High Women Civil Liberties Index"],
  dem_index: ["All", "Democracy Index Greater Than 0.5", "Democracy Index Less or Equal to 0.5"],
  selection: "All",// + YOUR FILTER SELECTION
  selection_dem: "All",
  selection_country: "All"
};

/* LOAD DATA */
d3.csv("../data/dem_data.csv", d3.autoType).then(raw_data => {
  // + SET YOUR DATA PATH

  console.log("raw_data", raw_data);
  state.data = raw_data;
  for (i in state.data) {
    state.countries.push(state.data[i]["country_name"])
    console.log(state.data[i])
    console.log(state.data[i]["v2x_gencl_val"])
  }

  console.log(state.countries)
  //console.log(state.gender_i)
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in 
function init() {
  // + SCALES

  xScale = d3
    .scaleLinear()
    .domain(d3.extent(state.data, d => d.v2x_polyarchy))
    .range([margin.left, width - margin.right]);

  yScale = d3
    .scaleLinear()
    .domain(d3.extent(state.data, d => d.v2x_freexp_thick))
    .range([height - margin.bottom, margin.top]);

  // + AXES

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);


  // + UI ELEMENT SETUP

  const selectElement = d3.select("#dropdown").on("change", function () {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected

    state.selection = this.value
    console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
  });

  const selectElement_dem = d3.select("#dropdown_dem").on("change", function () {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected

    state.selection_dem = this.value
    console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
  });

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data(state.gender_i) // + ADD UNIQUE VALUES
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  selectElement_dem
    .selectAll("option")
    .data(state.dem_index)
    .join("option")
    .attr("value", d => d)
    .text(d => d)

  // + CREATE SVG ELEMENT

  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // + CALL AXES

  // add the xAxis
  svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dy", "3em")
    .text("Freedom of Expression Index");

  // To what extent does government respect press & media freedom, the freedom of ordinary people to 
  //discuss political matters at home and in the public sphere, as well as the freedom of academic and 
  //cultural expression? 

  // add the yAxis
  svg
    .append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "50%")
    .attr("dx", "-3em")
    .attr("writing-mode", "vertical-rl")
    .text("Electoral Democracy Index");

  //To what extent is the ideal of electoral democracy in its fullest sense achieved? 


  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {

  let filteredData = state.data;
  // + FILTER DATA BASED ON STATE

  if (state.selection !== "All") {
    filteredData = state.data.filter(d =>
      //Here I tried adding filtering with another dropdown to compare to a specific threshold but I was not able to complete it
      //I do know why this specific statement is not giving me what i want exactly tho.. need to look more into it
      //state.selection_dem == "Democracy Index Greater Than 0.5" ? d.v2x_polyarchy > 0.5 : d.v2x_polyarchy < 0.5,
      d.v2x_gencl_val === state.selection)
  }

  // if (state.selection_dem != "All"){
  //   filteredData_dem = filteredData.filter(function(d){
  //     d.v2x_polyarchy > 0.5;
  //   });
  // }

  //tooltip
  const div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  const dot = svg
    .selectAll("circle")
    .data(filteredData, d => d.name)
    .join(
      enter =>
        enter
          .append("circle")
          .attr("class", "dot") // Note: this is important so we can identify it in future updates
          .attr("stroke", "lightgrey")
          .attr("opacity", 0.5)
          .attr("r", radius / 2)
          .attr("fill", d => {
            //color depending on the women civil liberties index
            if (d.v2x_gencl < 0.5) return "#f03b20";
            else if (d.v2x_gencl > 0.5) return "#feb24c";
          })
          .attr("cy", d => yScale(d.v2x_polyarchy))
          .attr("cx", d => xScale(d.v2x_freexp_thick)) // initial value - to be transitioned
          .call(enter =>
            enter
              .transition()
              .delay(d => 500 * d.v2x_freexp_thick)
              .duration(700)
              .attr("r", radius * 2))
          //Adding tooltip here to see which country is represented by which dot
          .on("mouseover", function (d) {
            div.transition()
              .duration(200)
              .style("opacity", .9);
            div.html(d.country_name)
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
          })
          .on("mouseout", function (d) {
            div.transition()
              .duration(500)
              .style("opacity", 0);
          })
      ,
      update =>
        update.call(update =>
          update
            .transition()
            .duration(500)
        )
      ,
      exit =>
        exit.call(exit =>
          exit
            .transition()
            .duration(700)
            .attr("r", radius / 2)
        )
    );

}
