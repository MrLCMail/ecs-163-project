const truewidth = window.innerWidth;
const trueheight = window.innerHeight;
const width = truewidth * .7
const height = trueheight -80
console.log(width, height);
const lowBoundary = 6;
const highBoundary = 8;
k = height /width
d3.csv("./titles.csv", d3.autoType).then(function(data){
    console.log("data", data);
    const data_filtered1 = data.filter(item => item.imdb_score != null);
    const data_filtered = data_filtered1.filter(item => item.tmdb_popularity != null)
    const xExtend = d3.extent(data_filtered, d=>d.tmdb_popularity);
    data_filtered.sort(function(a,b){return a.tmdb_popularity - b.tmdb_popularity});
    console.log(data_filtered);
    x = d3.scaleLinear()
    .domain(xExtend)
    .range([0, width]);
    y = d3.scaleLinear()
    .domain([0, 11])
    .range([height, 0]);
    let xAxis = (g, x) => g
    .attr("transform", `translate(0,${height})`)
   
    .call(d3.axisTop(x).tickFormat(d3.format(".0f")).ticks(10))
    .call(g => g.select(".domain").attr("display", "none"));
    let yAxis = (g, y) => g
    
    .call(d3.axisRight(y).ticks(10))
    .call(g=>g.select(".domain").attr("display", "none"));
    const zoom = d3.zoom()
        .scaleExtent([0.5, 32])
        .on("zoom", zoomed);
    const svg_original = d3.select("svg");
    const svg = svg_original.append("svg")
    const gDot = svg.append("g")
   
        .attr("fill", "none")
        .attr("stroke-linecap", "round");
   console.log(data_filtered[0].release_year)
    gDot.selectAll("path")
        .data(data_filtered)
        .join("path")
        .attr("d", d => `M${x(d.tmdb_popularity)},${y(d.imdb_score)}h0`)
        .attr("stroke", d => d.imdb_score>=8 ? "blue" : (d.imdb_score) >= 6 ? "purple" : "red");

    const gx = svg.append("g");
    const gy = svg.append("g");
    svg_original.call(zoom).call(zoom.transform, d3.zoomIdentity);

    function zoomed() {
        let transform = d3.event.transform;
        const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
        const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
        gDot.attr("transform", transform).attr("stroke-width", 5 / transform.k);
        
        gx.call(xAxis, zx);
        gy.call(yAxis, zy);
        gDot.selectAll("path")
        
    }
   
    svg.attr("transform",`translate(30, 20)`)
    const svg2 = svg_original.append("svg")
    svg2.append("text")
    .attr("text-anchor", "middle")
    .attr("x", width /2)
    .attr("y", trueheight - 20)
    .text("TMBD Score");
    svg2.append("text")
    .attr("text-anchor", "middle")
    
    .attr("x", -height/2)
    .attr("y", 20)
    .attr("transform", "rotate(-90)")
    .text("IMDB Score");
    
    const svg3 = svg_original.append("svg")

});