
(function () {
// set dimensions of graph
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;
const truewidth = Math.min(960, windowWidth);
const trueheight = Math.min(600, windowHeight);

const margins = {left : 60, bottom : 50, top: 20, right: 140}
const width =truewidth - margins.left - margins.right;
const height = trueheight - margins.bottom - margins.top;

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
    streamGraph.selectAll(".layer")
    .data(stackedData)
    .join("path")
    .attr("class", "layer")
    .style("fill", function(d) { return color(d.key);})
    .attr("d", d3.area()
    .x(function(d, i){return x(d.data.year);})
    .y0(function(d){return y(d[0]);})
    .y1(function(d){return y(d[1]);})
    )

   
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
    .text("Film Amount");
    //create regular title
    labels.append("text")
    .attr("text-anchor", "middle")
    .attr("x", truewidth/2)
    .attr("y", margins.top)
    .text("Content Quality Over the Years")
    // create container for movie and show filters
    let movie_only = {}
    let show_only = {}
     //create container to sort the data
    for (let i = minYear; i<=maxYear; i++){
        movie_only[i] = {year : i, low : 0, medium : 0, high : 0};
        show_only[i] = {year : i, low : 0, medium : 0, high : 0};
    }
    //filter for movies and shows
     for (let i = 0; i<data.length; i++){
        curYear = data[i].release_year;
        if (data[i].imdb_score == null){
            continue;
        }
        if (data[i].type == "MOVIE"){
        if (data[i].imdb_score < 6){
            movie_only[curYear].low = movie_only[curYear].low + 1;
        }
        else if(data[i].imdb_score < 8){
            movie_only[curYear].medium = movie_only[curYear].medium + 1;

        }
        else{
            movie_only[curYear].high = movie_only[curYear].high + 1;
        }
    }
    else if (data[i].type == "SHOW"){
        if (data[i].imdb_score < 6){
            show_only[curYear].low = show_only[curYear].low + 1;
        }
        else if(data[i].imdb_score < 8){
            show_only[curYear].medium = show_only[curYear].medium + 1;

        }
        else{
            show_only[curYear].high = show_only[curYear].high + 1;
        }
    }
    }
    //create final data array
     let finalMovie = [];
     let finalShow = [];
   //transform the container into an array
   for (let i = minYear; i <= maxYear; i++){
    finalMovie.push(movie_only[i]);
    finalShow.push(show_only[i]);
   }
   //create data stacks
     const stackedMovie = d3.stack()
    .offset(d3.stackOffsetSilhouette)
    .keys(["low", "medium", "high"])
    (finalMovie);
      const stackedShow = d3.stack()
    .offset(d3.stackOffsetSilhouette)
    .keys(["low", "medium", "high"])
    (finalShow);

   
   // create variables to be used in transitions
    const options = ["Movies", "Shows", "Both"];
    const dataStacks = [stackedMovie, stackedShow, stackedData]
    let curState = 2;
   //create container for buttons
   const btnContainer = svg_original.append("foreignObject")
  .attr("x", truewidth - margins.right + 40)  
  .attr("y", trueheight/2 - margins.top -20)
  .attr("width", 80)
  .attr("height", 200);

// create div for buttons ; this is the way i got it to work best without screwing up the chart placement
const btnDiv = btnContainer.append("xhtml:div")
  .style("display", "flex")
  .style("flex-direction", "column")
  .style("gap", "8px");

  //add a button for each option
btnDiv.selectAll("button")
  .data(options)
  .join("button")
  .text(d => d)
  .style("padding", "6px 12px")
  .on("click", (event, d) => filterTheChart(d) );
 
  //function for chart filtering
  function filterTheChart(button){
    //console.log(button);
    // if new state is same, don't change
    if (curState == options.indexOf(button)){
        return;
    }
    else{
        

    curState = options.indexOf(button);
    //transition to new graph state
    streamGraph.selectAll(".layer")
    
    .data(dataStacks[curState])
    .join("path")
    .attr("class", "layer")
    .transition()
    .duration(800)
    .style("fill", function(d) { return color(d.key);})
    .attr("d", d3.area()
    .x(function(d, i){return x(d.data.year);})
    .y0(function(d){return y(d[0]);})
    .y1(function(d){return y(d[1]);})
    )
        
    }

  }

  // implements a color legend
  const legend = svg_original.append("svg")
  legend.append("circle")
  .attr("cx", truewidth - margins.right + 30)      
  .attr("cy", 30)      
  .attr("r", 5)        
  .style("fill", "blue"); 
  legend.append("text")
  .attr("x", truewidth - margins.right + 40)
  .attr("y", 30)
   .attr("text-anchor", "left")
   .attr("dominant-baseline", "central")
  .style("font-size", "12px")
  .text("High Quality")
   legend.append("text")
  .attr("x", truewidth - margins.right + 40)
  .attr("y", 42)
   .attr("text-anchor", "left")
   .attr("dominant-baseline", "central")
  .style("font-size", "12px")
  .text("Score >= 8")

  legend.append("circle")
  .attr("cx", truewidth - margins.right + 30)      
  .attr("cy", 57)      
  .attr("r", 5)        
  .style("fill", "Purple"); 
  legend.append("text")
  .attr("x", truewidth - margins.right + 40)
  .attr("y", 57)
   .attr("text-anchor", "left")
   .attr("dominant-baseline", "central")
  .style("font-size", "12px")
  .text("Medium Quality")
   legend.append("text")
  .attr("x", truewidth - margins.right + 40)
  .attr("y", 69)
   .attr("text-anchor", "left")
   .attr("dominant-baseline", "central")
  .style("font-size", "12px")
  .text("8> Score >=6")

  legend.append("circle")
  .attr("cx", truewidth - margins.right + 30)      
  .attr("cy", 84)      
  .attr("r", 5)        
  .style("fill", "red"); 
  legend.append("text")
  .attr("x", truewidth - margins.right + 40)
  .attr("y", 84)
   .attr("text-anchor", "left")
   .attr("dominant-baseline", "central")
  .style("font-size", "12px")
  .text("Low Quality")
   legend.append("text")
  .attr("x", truewidth - margins.right + 40)
  .attr("y", 96)
   .attr("text-anchor", "left")
   .attr("dominant-baseline", "central")
  .style("font-size", "12px")
  .text("Score <6")
});
})();