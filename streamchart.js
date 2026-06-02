
(function () {
// set dimensions of graph
const truewidth = 960;
const trueheight = 600;
const margins = {left : 60, bottom : 50, top: 20, right: 80}
const width = truewidth - margins.left - margins.right;
const height = trueheight - margins.bottom - margins.top

//define the boundaries for low, medium and high
const lowBoundary = 6;
const highBoundary = 8;
d3.csv("./titles.csv", d3.autoType).then(function(data){
    //find min and max years
    const years = data.map(point => point.release_year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    let cleanData = {};
    //create container to sort the data
    for (let i = minYear; i<=maxYear; i++){
        cleanData[i] = {year : i, low : 0, medium : 0, high : 0};
    }
    //sort the data into the container
    let curYear = 0;
    for (let i = 0; i<data.length; i++){
        curYear = data[i].release_year;
        if (data[i].imdb_score == null){
            continue;
        }
        if (data[i].imdb_score < 6){
            cleanData[curYear].low = cleanData[curYear].low + 1;
        }
        else if(data[i].imdb_score < 8){
            cleanData[curYear].medium = cleanData[curYear].medium + 1;

        }
        else{
            cleanData[curYear].high = cleanData[curYear].high + 1;
        }
    }
   let finalData = [];
   //transform the container into an array
   for (let i = minYear; i <= maxYear; i++){
    finalData.push(cleanData[i]);
   }
   //create svg
   const svg_original = d3.select("#stream-svg")
   .attr("width", truewidth)
   .attr("height", trueheight);
   //create stream graph
   const streamGraph = svg_original.append("svg")
   .attr("width", truewidth)
   .attr("height", trueheight)
   .append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`)
   // add x scale
    const x = d3.scaleLinear()
    .domain(d3.extent(finalData, function(d){return d.year}))
    .range([0, width])
    //add x axis
    streamGraph.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format(".0f")).ticks(5));
   // add y scale
    const y = d3.scaleLinear()
    .domain([-500, 500])
    .range([height, 0]);
   // add y axis
    streamGraph.append("g")
    .call(d3.axisLeft(y));
    //create color scheme that matches with the scatterplot
    const color = d3.scaleOrdinal()
    .domain(["low", "medium", "high"])
    .range(["red", "purple", "blue"]);
   //create a stackedData scheme 
    const stackedData = d3.stack()
    .offset(d3.stackOffsetSilhouette)
    .keys(["low", "medium", "high"])
    (finalData);
  // implements the streams for the stream chart
    streamGraph.selectAll("mylayers")
    .data(stackedData)
    .join("path")
    .style("fill", function(d) { return color(d.key);})
    .attr("d", d3.area()
    .x(function(d, i){return x(d.data.year);})
    .y0(function(d){return y(d[0]);})
    .y1(function(d){return y(d[1]);})
    )

    console.log(finalData);
    // create container to put the labels
    const labels = svg_original.append("svg")
    // add x axis label
     labels.append("text")
    .attr("text-anchor", "middle")
    .attr("x", truewidth /2)
    .attr("y", trueheight - 20)
    .text("Year");
    // create y axis title
    labels.append("text")
    .attr("text-anchor", "middle")
    
    .attr("x", -trueheight/2)
    .attr("y", 15)
    .attr("transform", "rotate(-90)")
    .text("Movie Category Amount");
    //create regular title
    labels.append("text")
    .attr("text-anchor", "middle")
    .attr("x", truewidth/2)
    .attr("y", margins.top)
    .text("Movie Quality Over the Years")
    

});
})();