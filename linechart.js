(function () {
    // set dimensions of graph
    const trueWidth = 960;
    const trueHeight = 600;
    const margin = {
        left: 85,
        right: 35,
        top: 45,
        bottom: 65
    };
    const chartWidth = trueWidth - margin.left - margin.right;
    const chartHeight = trueHeight - margin.top - margin.bottom;
    // parse the subscription date format
    const parseSubscriptionDate = d3.timeParse("%d-%m-%Y");
    // create options for different line chart metrics
    const metricChoices = {
        avgImdb: {
            label: "Average IMDb Score",
            yLabel: "Average IMDb Score",
            xLabel: "Release Decade",
            value: d => d.avgImdb,
            format: d3.format(".2f"),
            tickFormat: d3.format(".1f"),
            fixedDomain: [0, 10],
            dataType: "decade"
        },
        count: {
            label: "Total Quantity of Titles",
            yLabel: "Number of Titles",
            xLabel: "Release Decade",
            value: d => d.count,
            format: d3.format(","),
            tickFormat: d3.format(","),
            dataType: "decade"
        },
        avgPopularity: {
            label: "Average TMDb Popularity",
            yLabel: "Average TMDb Popularity",
            xLabel: "Release Decade",
            value: d => d.avgPopularity,
            format: d3.format(".2f"),
            tickFormat: d3.format(".0f"),
            dataType: "decade"
        },
        subscribers: {
            label: "Netflix Subscribers",
            yLabel: "Netflix Subscribers",
            xLabel: "Time Period",
            value: d => d.subscribers,
            format: d3.format(","),
            tickFormat: d3.format(".2s"),
            dataType: "time"
        }
    };
    // create svg
    const svg = d3.select("#line-svg")
        .attr("width", trueWidth)
        .attr("height", trueHeight);
    // change section title
    const section = d3.select("#chart1");
    section.select("h2")
        .text("Netflix Quality Trend Over Years");
    // create a wrapper to place chart and buttons next to each other
    const wrapper = section.append("div")
        .attr("class", "line-chart-wrapper")
        .style("display", "flex")
        .style("align-items", "center")
        .style("gap", "24px");
    wrapper.node().appendChild(svg.node());
    // create button container
    const controls = wrapper.append("div")
        .attr("class", "line-chart-controls")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("gap", "10px")
        .style("min-width", "210px");
    // add instruction for button choices
    controls.append("div")
        .style("font-weight", "bold")
        .style("margin-bottom", "4px")
        .style("color", "#E50914")
        .text("Choose vertical axis");
    // create chart group
    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    // create x axis and y axis containers
    const xAxisGroup = chart.append("g")
        .attr("transform", `translate(0,${chartHeight})`);
    const yAxisGroup = chart.append("g");
    // create path for the line
    const linePath = chart.append("path")
        .attr("fill", "none")
        .attr("stroke", "#E50914")
        .attr("stroke-width", 3);
    // create group for points on the line
    const dotGroup = chart.append("g");
    // add x axis label
    const xLabel = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", margin.left + chartWidth / 2)
        .attr("y", trueHeight - 18)
        .attr("fill", "#000000")
        .text("Release Decade");
    // add y axis label
    const yLabel = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -(margin.top + chartHeight / 2))
        .attr("y", 22)
        .attr("fill", "#000000");
    // add chart title
    const title = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", trueWidth / 2)
        .attr("y", 24)
        .attr("fill", "#000000")
        .style("font-size", "18px")
        .style("font-weight", "bold");
    // create tooltip for hovering over data points
    const tooltip = section.append("div")
        .style("position", "absolute")
        .style("padding", "8px 10px")
        .style("background", "#111111")
        .style("color", "#ffffff")
        .style("border", "1px solid #E50914")
        .style("border-radius", "6px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0);
    // load titles data and subscription data
    Promise.all([
        d3.csv("./titles.csv", d3.autoType),
        d3.csv("./Subscription.csv", d3.autoType)
    ]).then(function ([titleData, subscriptionRawData]) {
        // remove rows without valid release year
        const cleanTitleData = titleData.filter(d => Number.isFinite(d.release_year));
        // group title data by decade
        const decadeData = d3.rollups(cleanTitleData,
            rows => ({
                decade: Math.floor(rows[0].release_year / 10) * 10,
                count: rows.length,
                avgImdb: d3.mean(rows, d =>
                    Number.isFinite(d.imdb_score) ? d.imdb_score : undefined
                ),
                avgPopularity: d3.mean(rows, d =>
                    Number.isFinite(d.tmdb_popularity) ? d.tmdb_popularity : undefined
                )
            }),
            d => Math.floor(d.release_year / 10) * 10
        )
            .map(d => d[1])
            .sort((a, b) => a.decade - b.decade);
        // clean and sort subscription data
        const subscriptionData = subscriptionRawData
            .map(d => {
                const date = parseSubscriptionDate(d["Time Period"]);
                return {
                    date: date,
                    timePeriod: d["Time Period"],
                    subscribers: +d.Subscribers
                };
            })
            .filter(d =>
                d.date !== null &&
                Number.isFinite(d.subscribers)
            )
            .sort((a, b) => a.date - b.date);
        // create one button for each metric option
        controls.selectAll("button")
            .data(Object.entries(metricChoices))
            .join("button")
            .attr("type", "button")
            .style("padding", "9px 12px")
            .style("border", "1px solid #E50914")
            .style("border-radius", "6px")
            .style("background", "#111111")
            .style("color", "#E50914")
            .style("cursor", "pointer")
            .style("text-align", "left")
            .text(d => d[1].label)
            .on("click", function (event, d) {
                updateChart(d[0]);
            });

        // draw default line chart
        updateChart("avgImdb");
        // update the chart when users select a different metric
        function updateChart(metricKey) {
            const metric = metricChoices[metricKey];
            let chartData;
            let x;
            let xAxis;
            // use time scale for subscription data
            if (metric.dataType === "time") {
                chartData = subscriptionData;

                x = d3.scaleTime()
                    .domain(d3.extent(chartData, d => d.date))
                    .range([0, chartWidth]);

                xAxis = d3.axisBottom(x)
                    .ticks(d3.timeYear.every(1))
                    .tickFormat(d3.timeFormat("%Y"));
            }
            // use decade scale for title data
            else {
                chartData = decadeData.filter(d =>
                    metric.value(d) !== undefined &&
                    metric.value(d) !== null &&
                    Number.isFinite(metric.value(d))
                );
                x = d3.scalePoint()
                    .domain(chartData.map(d => d.decade))
                    .range([0, chartWidth])
                    .padding(0.5);
                xAxis = d3.axisBottom(x)
                    .tickFormat(d => `${d}s`);
            }
            // update x axis
            xAxisGroup.call(xAxis);
            styleAxis(xAxisGroup);
            // set y scale range
            let yDomain;
            if (metric.fixedDomain) {
                yDomain = metric.fixedDomain;
            } else {
                const yMax = d3.max(chartData, d => metric.value(d));
                yDomain = [0, yMax * 1.1];
            }

            const y = d3.scaleLinear()
                .domain(yDomain)
                .nice()
                .range([chartHeight, 0]);
            // create line generator
            const line = d3.line()
                .x(d => getXPosition(d, x, metric))
                .y(d => y(metric.value(d)));
            // highlight currently selected button
            controls.selectAll("button")
                .style("background", d => d[0] === metricKey ? "#E50914" : "#111111")
                .style("color", d => d[0] === metricKey ? "#ffffff" : "#E50914")
                .style("font-weight", d => d[0] === metricKey ? "bold" : "normal");
            // update y axis
            yAxisGroup.call(
                d3.axisLeft(y)
                    .ticks(8)
                    .tickFormat(metric.tickFormat)
            );

            styleAxis(yAxisGroup);
            // transition the line to the new metric
            linePath.datum(chartData)
                .transition()
                .duration(600)
                .attr("d", line);
            // create and update dots
            const dots = dotGroup.selectAll("circle")
                .data(chartData, d => getDataKey(d));
            dots.join(
                enter => enter.append("circle")
                    .attr("cx", d => getXPosition(d, x, metric))
                    .attr("cy", chartHeight)
                    .attr("r", 5)
                    .attr("fill", "#E50914")
                    .call(enter => enter.transition()
                        .duration(600)
                        .attr("cy", d => y(metric.value(d)))
                    ),

                update => update.call(update => update.transition()
                    .duration(600)
                    .attr("cx", d => getXPosition(d, x, metric))
                    .attr("cy", d => y(metric.value(d)))
                ),

                exit => exit.call(exit => exit.transition()
                    .duration(300)
                    .attr("cy", chartHeight)
                    .remove()
                )
            )
                // show tooltip when mouse is on a dot
                .on("mouseover", function (event, d) {
                    d3.select(this)
                        .attr("r", 7);
                    tooltip
                        .style("opacity", 1)
                        .html(getTooltipText(d, metric, metricKey));
                })
                // move tooltip with the mouse
                .on("mousemove", function (event) {
                    tooltip
                        .style("left", `${event.pageX + 12}px`)
                        .style("top", `${event.pageY - 28}px`);
                })
                // hide tooltip when mouse leaves
                .on("mouseout", function () {
                    d3.select(this)
                        .attr("r", 5);

                    tooltip.style("opacity", 0);
                });
            // update labels and title
            xLabel.text(metric.xLabel);
            yLabel.text(metric.yLabel);
            title.text(metric.label + " Over Time");
        }
        // get correct x position based on data type
        function getXPosition(d, x, metric) {
            if (metric.dataType === "time") {
                return x(d.date);
            }
            return x(d.decade);
        }
        // create a stable key for each data point
        function getDataKey(d) {
            if (d.date) {
                return d.date.getTime();
            }

            return d.decade;
        }
        // create tooltip text for each metric
        function getTooltipText(d, metric, metricKey) {
            if (metricKey === "subscribers") {
                return (
                    `<strong>${d.timePeriod}</strong><br>` +
                    `Subscribers: ${metric.format(d.subscribers)}`
                );
            }
            return (
                `<strong>${d.decade}s</strong><br>` +
                `${metric.label}: ${metric.format(metric.value(d))}<br>` +
                `Avg IMDb: ${formatValue(d.avgImdb, metricChoices.avgImdb.format)}<br>` +
                `Total titles: ${formatValue(d.count, metricChoices.count.format)}<br>` +
                `Avg popularity: ${formatValue(d.avgPopularity, metricChoices.avgPopularity.format)}`
            );
        }
        // make axis text and lines black so they are easier to see
        function styleAxis(axisGroup) {
            axisGroup.selectAll("text")
                .attr("fill", "#000000");
            axisGroup.selectAll("line")
                .attr("stroke", "#000000");
            axisGroup.selectAll("path")
                .attr("stroke", "#000000");
        }
        // format missing values as N/A
        function formatValue(value, formatter) {
            if (value === undefined || value === null || !Number.isFinite(value)) {
                return "N/A";
            }
            return formatter(value);
        }
    });
})();