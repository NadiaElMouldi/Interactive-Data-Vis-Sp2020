/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

let svg;
let tooltip;

/**
 * APPLICATION STATE
 * */
let state = {
  data: null,
  hover: null,
  mousePosition: null,
  // + INITIALIZE STATE
};

/**
 * LOAD DATA
 * */
d3.json("../data/flare.json", d3.autotype).then(data => {
  state.data = data;
  console.log(state.data)
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {


  const container = d3.select("#d3-container").style("position", "relative");

  tooltip = container
  .append("div")
  .attr("class", "tooltip")
  .attr("width", 100)
  .attr("height", 100)
  .style("position", "absolute");

  svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  //const colorScale = d3.scaleLinear().range(["beige","red"]);
  const colorScale = d3.scaleOrdinal(d3.schemePastel2);

  // + INITIALIZE TOOLTIP IN YOUR CONTAINER ELEMENT

  
  // + CREATE YOUR ROOT HIERARCHY NODE

  const root = d3
    .hierarchy(state.data)
    .sum(d =>d.value)
    .sort((a,b) => b.value - a.value)

  // + CREATE YOUR LAYOUT GENERATOR

  const circlePack = d3
  .pack()
  .size([width, height])
  .padding(1);


  // + CALL YOUR LAYOUT FUNCTION ON YOUR ROOT DATA
  circlePack(root)
  console.log(circlePack(root))

  // + CREATE YOUR GRAPHICAL ELEMENTS
  const leaf = svg
  .selectAll("g")
  .data(root.leaves())
  .join("g")
  .attr("transform", d => `translate(${d.x},${d.y})`);

  console.log(leaf)
  
  leaf
    .append("circle")
    .attr("fill", d => {
      const level1 = d.ancestors().find(d => d.depth == 1);
      return colorScale(level1.data.name)
    })
    .attr("r", d => d.r)
    .on("mouseover", d => {
      state.hover = {
        translate: [
          d3.mouse(svg.node())[0],
          d3.mouse(svg.node())[1],
        ],
        name: d.data.name,
        value: d.data.value,
        title: `${d
          .ancestors()
          .reverse()
          .map(d => d.data.name)
          .join("/")}`,
        };
        console.log(state.hover)
        draw()    
    });

  draw(); 
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
  // + UPDATE TOOLTIP
  if(state.hover) {
    tooltip
      .html(
        `
        <div>Name: ${state.hover.name}</div>
        <div>Value: ${state.hover.value}</div>
        <div>Hierarchy Path: ${state.hover.title}</div>  
        `
      )
      .transition()
      .duration(500)
      .style(
        "transform",
        `translate(${state.hover.translate[0]}px,${state.hover.translate[1]}px)`
      )
  }
}
