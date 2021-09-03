// Setup Plotly config as a const as we will reuse it for all charts
const config = {
    displayModeBar: false,
    responsive: true
}
const lineColors = {
    green: "#44bb66",
    red: "#bb4466",
    blue: "#4466bb",
}
    
//Comparative Data
Plotly.d3.csv("Niger_World U5CMR.csv", function(rows) {

    var trace1 = {
        type: "scatter",
        mode: "lines",
        name: 'World',
        x: unpack(rows, 'Year'),
        y: unpack(rows, 'World_CM'),
        line: { color: 'rgb(41, 69, 122)' }
    }

    var trace2 = {
        type: "scatter",
        mode: "lines",
        name: 'Niger',
        x: unpack(rows, 'Year'),
        y: unpack(rows, 'Niger_CM'),
        line: { color: 'rgb(110, 158, 254)' }
    }

    var data3 = [trace1, trace2];

    var layout3 = {
        title: "World vs Niger's Child Mortality Rate 1950 - 2010",
        xaxis: {
            title: 'Year'
        },
        yaxis: {
            title: 'Mortality Rate (per 1000) '
        }
    };


    Plotly.newPlot("line-graph1", data3, layout3, config);

    function unpack(rows, key) {
        return rows.map(function(row) { return row[key]; });
    }
});









//Pie Chart
var pie_data = [{
    values: [15, 12, 10, 63],
    labels: ['Pneumonia', 'Neonatal', 'Diarrheal', 'Other'],
    type: 'pie',
    hoverinfo: 'label+percent',
    marker: {colors: ['rgb(41, 69, 122)', 'rgb(63, 99, 166)', 'rgb(110, 158, 254)', 'rgb(192, 211, 254)',]},
    textinfo: "label",
    insidetextorientation: "radial"
  }];
  
  Plotly.newPlot('pie-chart', pie_data, config);






//Future Prediction Graph
Plotly.d3.csv("mortality.csv", make_plot);
  //Data Processing 
function make_plot(csv_data){
    let country_data = csv_data.filter(d => d.country == "Niger");


//Prepare Data for regressor --------------------------------------------------------------------------
    //Convert string into numeric value
    let mortality_data = country_data.map(d => Number(d.mortality))
    //Normalise Data
    let min_mortality = Math.min(...mortality_data) //Make min val = 0
    let max_mortality = Math.max(...mortality_data) //Make max val = 1

    //This regression library needs values stored in arrays
    //We are using the strech function to normalise our data
    let regression_data = country_data.map(d => [stretch(d.year, 1950, 2017, 0, 1),
                                                 stretch(d.mortality, min_mortality, max_mortality, 0, 1)])

            console.log(regression_data) //data check



//Train Regressor
    //Installed regressor - Here is where we train our regressor, experiment with the order value
    let regression_result = regression.polynomial(regression_data, {order: 4});


//Generate Prediction output
    //Now we have a trained predictor, lets actually use it!
    let predicted_year_x = [];
    let predicted_mortality_y = [];
    //Predict between 2017 - 2030
    for(let year = 2017; year < 2031; year++){
        //We've still got to work in the normalised scale
        let prediction = regression_result.predict(stretch(year, 1950, 2017, 0, 1))[1]

        predicted_year_x.push(year);
        //Make sure to un-normalise for displaying on the plot
        predicted_mortality_y.push(stretch(prediction, 0, 1, min_mortality, max_mortality));
    }


//Graphing-------------------------------------------------------------------------------------

//Line Graph - Future Prediction 
    //Original - Niger Child Mortality Trace 
    let data = [{
        x: country_data.map(d => d.year),
        y: country_data.map(d => d.mortality),
        mode: 'lines',
        name: "Historical",
        line: {
            color: 'rgb(24, 40, 71)',
            width: 3
          }
    },
    //Predicted - Niger Child Mortality Trace 
    {
        x: predicted_year_x,
        y: predicted_mortality_y,
        mode: 'lines',
        name: "Predicted",
        line: {
            dash: 'dot',
            color: 'rgb(110, 158, 254)',
            width: 4,
          }
    }]

    //Draw out graph
    Plotly.newPlot('prediction-graph', data, layout_future, config);

    //Styling
    var layout_future = {
        title: "Niger's Predicted Child Mortality Rate in 2030",
        xaxis: {
            title: 'Year'
        },
        yaxis: {
            title: 'Mortality Rate '
        },  
  };
}

//Other functions ------------------------------------------------------------------------------

//Stretch function from wk8 tutorial example
function stretch(n, start1, stop1, start2, stop2) {
    return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
}



  




