/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

/** these variables allow us to access anything we manipulate in
 * init() but need access to in draw().
 * All these variables are empty before we assign something to them.*/
let svg;

/**
 * APPLICATION STATE
 * */
let state = {
  geojson: null,
  extremes: null,
  // + SET UP STATE
  hover: {
    latitude: null,
    longitude: null,
    change: null,
    state: null,
  },
};

/**
 * LOAD DATA
 * Using a Promise.all([]), we can load more than one dataset at a time
 * */
Promise.all([
  d3.json("../../data/us-state.json"),
  d3.csv("../../data/usHeatExtremes.csv", d3.autoType),
]).then(([geojson, extremes]) => {
  // + SET STATE WITH DATA
  state.geojson = geojson;
  state.extremes = extremes;
  console.log("state: ", state);
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  // create an svg element in our main `d3-container` element
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // + SET UP PROJECTION
  const projection = d3.geoAlbersUsa().fitSize([width, height],state.geojson)

  // + SET UP GEOPATH
  const path = d3.geoPath().projection(projection);
  console.log(projection([-73.9833,40.7423]))

  // + DRAW BASE MAP PATH
  svg.selectAll(".state")
  .data(state.geojson.features)
  .join("path")
  .attr("d", path)
  .attr("class","state")
  .attr("fill","transparent")
  .attr("stroke","lightgrey")
  .on("mouseover", d => {
    state.hover["state"] = d.properties.NAME;
    draw();
  })

  //adding circles

  svg
    .selectAll("circle")
    .data(state.extremes, d => d)
    .enter()
    .append("circle")
    .attr("fill", d => {return d["Change in 95 percent Days"] < 1 ? "steelblue": "green"} )
    .attr("opacity","0.5")
    .attr("r", d => Math.abs(d["Change in 95 percent Days"]/4))
    .attr("cx", d => projection([d["Long"],d["Lat"]])[0])
    .attr("cy", d => projection([d["Long"],d["Lat"]])[1])
    .on("mouseover", d => {
      state.hover["change"] = d["Change in 95 percent Days"];
      draw();
    })

   

  // + ADD EVENT LISTENERS (if you want)
  svg.on("mousemove", () => {
    const [x,y] = d3.mouse(svg.node())
    const proj = projection.invert([x,y])
    state.hover["latitude"] = proj[0]
    state.hover["longitude"] = proj[1]
  })

  draw(); // calls the draw function
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
  hoverData = Object.entries(state.hover);

  d3.select("#hover-content")
    .selectAll("div.row")
    .data(hoverData)
    .join("div")
    .attr("class", "row")
    .html(
      d =>
        d[1] ? `${d[0]}: ${d[1]}`: null // otherwise, show nothing
    );
}
