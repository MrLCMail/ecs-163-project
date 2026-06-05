(function () {
// set dimensions of graph
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;
const truewidth = Math.min(960, windowWidth);
const trueheight = Math.min(600, windowHeight);
const margins = {left : 50, bottom : 50, top: 20, right: 20}
const width = truewidth - margins.left - margins.right;
const height = trueheight - margins.bottom - margins.top
console.log(width, height);
//define the boundaries for low, medium and high
const lowBoundary = 6;
const highBoundary = 8;
k = height /width
d3.csv("./titles.csv", d3.autoType).then(function(data){
    console.log("data", data);
    // filter imdb scores that are null
    const data_filtered1 = data.filter(item => item.imdb_score != null);
    //filter tmbd popularity that are null
    const data_filtered = data_filtered1.filter(item => item.tmdb_popularity != null)
    // get extent to use as domain
    const xExtend = d3.extent(data_filtered, d=>d.tmdb_popularity);
    data_filtered.sort(function(a,b){return a.tmdb_popularity - b.tmdb_popularity});
    console.log(data_filtered);
    // set x scale
    x = d3.scaleLinear()
    .domain(xExtend)
    .range([0, width]);
    //set y scale
    y = d3.scaleLinear()
    .domain([0, 10])
    .range([height, 0]);
    //set xAxis
    let xAxis = (g, x) => g
    .attr("transform", `translate(0,${height})`)
   
    .call(d3.axisTop(x).tickFormat(d3.format(".0f")).ticks(10))
    .call(g => g.select(".domain").attr("display", "none"));
    // set yAxis
    let yAxis = (g, y) => g
    
    .call(d3.axisRight(y).ticks(10))
    .call(g=>g.select(".domain").attr("display", "none"));
    //define the zooming
    const zoom = d3.zoom()
        .scaleExtent([0.5, 32])
        .on("zoom", zoomed);
    // select scatter part of html
    const svg_original = d3.select("#scatter-svg")
    .attr("width", truewidth)
    .attr("height", trueheight);
    //append our svg
    const svg = svg_original.append("svg")
    //create the dots for the scatterplot
    const gDot = svg.append("g")
   
        .attr("fill", "none")
        .attr("stroke-linecap", "round");
   
    gDot.selectAll("path")
        .data(data_filtered)
        .join("path")
        .attr("d", d => `M${x(d.tmdb_popularity)},${y(d.imdb_score)}h0`)
        .attr("stroke", d => d.imdb_score>=8 ? "blue" : (d.imdb_score) >= 6 ? "purple" : "red");
    //create variables to be used for zooming
    const gx = svg.append("g");
    const gy = svg.append("g");
    //set initial zoom
    svg_original.call(zoom).call(zoom.transform, d3.zoomIdentity);
    //define the zoom function
    function zoomed({transform}) {
        
        const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
        const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
        gDot.attr("transform", transform).attr("stroke-width", 5 / transform.k);
        
        gx.call(xAxis, zx);
        gy.call(yAxis, zy);
        gDot.selectAll("path")
        
    }
    //translate graph to correct part of the screen
    svg.attr("transform",`translate(${margins.left}, ${margins.top})`)
    //create a second svg for axis titles and title
    const svg2 = svg_original.append("svg")
    //create x axis title
    svg2.append("text")
    .attr("text-anchor", "middle")
    .attr("x", truewidth /2)
    .attr("y", trueheight - 20)
    .text("TMDb Popularity");
    // create y axis title
    svg2.append("text")
    .attr("text-anchor", "middle")
    
    .attr("x", -trueheight/2)
    .attr("y", 20)
    .attr("transform", "rotate(-90)")
    .text("IMDb Score");
    //create regular title
    svg2.append("text")
    .attr("text-anchor", "middle")
    .attr("x", truewidth/2)
    .attr("y", margins.top)
    .text("TMDb popularity vs IMDb score")
    
    

});
})();