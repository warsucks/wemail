app.config(function ($stateProvider) {
    $stateProvider
    .state('tags', {
        url: '/tags',
        templateUrl: 'js/tagPopularity/tags-v-time.html',
        resolve: {
          allEmails: function(EmailFactory){
            return EmailFactory.getAll();
          }
        },
        controller: 'TagGraphCtrl'
    });
});

app.controller("TagGraphCtrl", function($scope, allEmails){

  $scope.absMinDate = new Date(2014, 1, 1);
  $scope.absMaxDate = new Date();
  $scope.minDate = new Date(2015, 2, 1);
  $scope.maxDate = new Date();

  $scope.colors = [
    "skyblue",
    "forestgreen",
    "hotpink",
    "purple",
    "orange",
    "darkblue"
  ]

  var xScale, yScale, padding, width, height;

  var maxY = 100;
  var svg = setUpGraph();

  //this is done just once
  $scope.allEmails = allEmails.map((email) => {
    email.timestamp = new Date(email.timestamp);
    email.date = new Date(email.timestamp.getFullYear(), email.timestamp.getMonth(), email.timestamp.getDate());
    return email;
  })

  $scope.lineArray = []; //an array of objects {tags:_, dataset: _}

  $scope.addSearch = (str) => {
    if(str){
      var tagsArray = strToArray(str);
      var filteredEmails = getFilteredEmails(tagsArray);
      var dataset = getDataSet(filteredEmails);
      $scope.lineArray.push({
        tags: tagsArray,
        dataset: dataset
      });
    }
    drawLines();
  }
  //this is done for every search
  function strToArray(str){
    return str.split(" ");
  }

  function drawOneLine(dataset, color){

    //console.log("drawing line for dataset", dataset);

    // draw line graph

    var line = d3.svg.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.freq))
        .interpolate('linear');

    var timeboundDataset = dataset.filter(point => {
      return point.date>=$scope.minDate && point.date<=$scope.maxDate;
    });

    console.log("timebound dataset", timeboundDataset);

    svg.append("svg:path")
      .attr("d", line(timeboundDataset))
      .attr("stroke", color);

    // plot circles
    // svg.selectAll("circle")
    //   .data(dataset)
    //   .enter()
    //   .append("circle")
    //   .attr("class", "data-point")
    //   .attr("cx", function(d) {
    //       return xScale(d.date);
    //   })
    //   .attr("cy", function(d) {
    //       return yScale(d.freq);
    //   })
    //   .attr("r", 5);
  }

  function drawLines(){

    d3.selectAll("path.line").remove();

    d3.select("svg").remove();



    xScale = d3.time.scale()
        .domain([$scope.minDate, $scope.maxDate])
        .range([padding, width - padding]);


    // var maxY = _.max($scope.lineArray, line => {
    //   return line.freq;
    // });

    // var l = $scope.lineArray[0];
    //
    // var maxOfL = _.max(l.dataset, point => {
    //   return point.freq;
    // }).freq;
    //
    // console.log("maxOfL", maxOfL);
    // var maxY = _.max($scope.lineArray, line => {
    //   var maxOfLine =  _.max(line.dataset, point => {
    //     return point.freq;
    //   });
    //   return maxOfLine.freq;
    // });

    var maxesOfLines = $scope.lineArray.map(line => {
      return _.max(line.dataset, point => point.freq).freq;
    });

    maxY = _.max(maxesOfLines);

    console.log("maxY", maxY);

    yScale = d3.scale.linear()
        .domain([0, maxY])
        .range([height - padding, padding]);

    svg = setUpGraph();

    $scope.lineArray.forEach((line, index)=> {
      drawOneLine(line.dataset, $scope.colors[index]);
    });
  }

  function getFilteredEmails(searchTagsArr){
    return $scope.allEmails.filter((email) => {
      var include = true;
      searchTagsArr.forEach((tag) => {
        if(email.tags.indexOf(tag)<0) {
          include = false;
        }
      });
      return include;
    });
  }

  function getDataSet(filteredEmails){

    var datasetObj = {};

    filteredEmails.forEach((email) => {
      if(datasetObj[email.date]){
        datasetObj[email.date].freq ++;
      }
      else {
        datasetObj[email.date] = {
          date: email.date,
          freq: 1
        }
      }
    });

    var dataset = _.values(datasetObj);

    for(var date = $scope.absMinDate; date<$scope.absMaxDate; date = new Date(date.getFullYear(), date.getMonth(), date.getDate()+1))
    {
      if(_.findIndex(dataset, (datapoint) => {
        return datapoint.date===date;
      })<0) {
        dataset.push({
          date: date,
          freq: 0
        })
      }
    }

    dataset.sort((a,b) => {
      if(a.date<b.date){
        return -1;
      }
      if(a.date>b.date){
        return 1;
      }
      return 0;
    });

    return dataset;
    //console.log("my dataset", dataset);
  }

  function setUpGraph() {

    width = 800;
    height = 400;
    // Create the SVG 'canvas'
    var svg = d3.select(".graph-area")
        .append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)

    // Define the padding around the graph
    padding = 50;

    // Set the scales
    //var minDate = d3.min(dataset, function(d) { return d.date; });
    //minDate.setDate(minDate.getDate());

    //var maxDate = d3.max(dataset, function(d) { return d.date; });

    xScale = d3.time.scale()
        .domain([$scope.minDate, $scope.maxDate])
        .range([padding, width - padding]);

    yScale = d3.scale.linear()
        .domain([0, maxY])
        .range([height - padding, padding]);

    // x-axis
    var format = d3.time.format("%d %b");

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickFormat(format)
        .ticks(d3.time.weeks,5);

    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0," + (height - padding) + ")")
        .call(xAxis);

    // y-axis
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickFormat(d => d)
        .tickSize(5, 5, 0)
        .ticks(5); // set rough # of ticks

    svg.append("g")
        .attr("class", "axis y-axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

    //y-axis title
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - padding)
        .attr("x",0 - (height / 2))
        .attr("dx", "1em")
        .style("text-anchor", "middle")
        .text("Number of Emails");

    //x-axis title
    svg.append("text")
        .attr("y", 0 + height)
        .attr("x",0 + width/2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Date");

    //graph title
    svg.append("text")
        .attr("y", 0)
        .attr("x",0 - padding + width/2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "20px")
        .text("Emails Sent Using Tags");

    return svg;
  }
});
