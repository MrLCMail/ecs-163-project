# ecs-163-project
## Description
The repository includes the dataset used to construct the graphs, the ds3 code used to construct the graphs, as well as an html to format a webpage in order to view the graphs. Each of the main graphics is represented in a different javascript file for the sake of modularity.

The linechart.js file contains the code for creating the line chart visualization. The file involves filtering to extract the correct data, and transforming some of the data to acquire the mean value for different years. In addition to the linechart, this file implements some buttons to be used in order to bring up different line chart visualizations

The scatterplot.js file contains the code for creating the scatterplot visualization. The file includes code for filtering out null values, and then plots all the data points. This file also includes code to allow for d3 zooming functionality for the scatterplot

The streamchart.js file contains the code for creating the streamchart visualization. The file includes code for filtering and binning the data to be used within the streamchart. Once the data is prepped, there is d3.js code that is used to create the visualization. The file also filters the data for just movies and just TV to be used in the filtered visualizations.


## Installation
To install the repository, click the code button and download as zip. Once downloaded extract the zip file.


## Execution
VScode and the Live Server package are required to run the code. To run the code, open the folder in Visual Studio Code, right click on the index.html file, and click open with live server. Once on the browser page, make sure to fullscreen it, and potentially refresh the page if for some the graphics did not load correctly at launch.

## Datasets:
Netflix Users: https://www.kaggle.com/datasets/sureshmuthusamy001p/netflix-customer-subscription

Movie Scores and Other Data: https://github.com/amirtds/kaggle-netflix-tv-shows-and-movies
