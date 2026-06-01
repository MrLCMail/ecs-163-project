(function () {
// set dimensions of graph
const truewidth = 960;
const trueheight = 600;
const margins = {left : 50, bottom : 50, top: 20, right: 20}
const width = truewidth - margins.left - margins.right;
const height = trueheight - margins.bottom - margins.top

//define the boundaries for low, medium and high
const lowBoundary = 6;
const highBoundary = 8;
d3.csv("./titles.csv", d3.autoType).then(function(data){
    const years = data.map(point => point.release_year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    let cleanData = {};
    for (let i = minYear; i<=maxYear; i++){
        cleanData[i] = {year : i, low : 0, medium : 0, high : 0};
    }
    
    let curYear = 0;
    for (let i = 0; i<data.length; i++){
        curYear = data[i].release_year;
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
   
   const svg_original = d3.select("#stream_svg");
   const streamGraph = svg_original.append("svg")
   .attr("width", truewidth)
   .attr("height", trueheight)
   .append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`)




});
})();