// load in csv
d3.csv("../../../data/squirrel_data.csv").then(data => {
  // once the data loads, console log it
  console.log("data", typeof (data));


  console.log("data", data);

  //this part is to create the that contains the sum of each column 
  //(I only have one summable column in my data)
  sum_hec = 0
  for (var i = 0; i < data.length; i++) {
    sum_hec = sum_hec + parseInt(data[i]["Hectare Squirrel Number"])
  }
  sum = [{
    "Unique Squirrel ID": "N/A",
    "Shift": "N/A",
    "Date": "N/A",
    "Age": "N/A",
    "Primary Fur Color": "N/A",
    "Highlight Fur Color": "N/A",
    "Location": "N/A",
    "Running": "N/A",
    "Chasing": "N/A",
    "Climbing": "N/A",
    "Eating": "N/A",
    "Foraging": "N/A",
    "Hectare Squirrel Number": sum_hec
  }]

  // select the `table` container in the HTML
  const table = d3.select("#d3-table");

  /** HEADER */
  const thead = table.append("thead");
  thead
    .append("tr")
    .append("th")
    .attr("colspan", "13")
    .text("Central Park Squirrel Census")
  thead
    .append("tr")
    .selectAll("th")
    .data(data.columns)
    .join("td")
    .text(d => d)
  //Made header bold
    .attr("class", d => {return "bold"})

  // /** BODY */
  // // rows
  const rows = table
    .append("tbody")
    .selectAll("tr")
    .data(data)
    .join("tr")


  console.log(rows)
  // // cells
  rows
    .selectAll("td")
    .data(d => Object.values(d))
    .join("td")
    // update the below logic to apply to your dataset
    //changed the color of the cell according to the color of the squirrel
    .attr("class", d => {
      if (d == "Gray") then: return "gray"
      else if (d == "Cinnamon") then: return "cinnamon"
      else if (d == "White") then: return "white"
    })
    .text(d => d)

  //get the rows that have no color reported for the squirrell
  const no_color_row = 
  rows
  .attr("class", d => {
    if (d["Primary Fur Color"] == "" && d["Highlight Fur Color"] == "")
      then: 
       return "no_color";
  })
  //color the celles in these rows in burlywood
  no_color_row
  .filter(".no_color")
  .selectAll("td")
  .attr("class", "no_color")
  
  //added summary row using the row object created initially
  const summary = table
    .append("tbody")
    .selectAll("tr")
    .data(sum)
    .join("tr")

  summary.selectAll("td")
    .data(d => Object.values(d))
    .join("td")
    .text(d => d)
  console.log(summary)

});
