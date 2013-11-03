$(function() {
  var colors = ["#1ABC9C", "#2ECC71", "#3498DB", "#9B59B6", "#34495E", "#F1C40F", "#E67E22", "#E74C3C", "#ECF0F1"];
  function getRandomColor() {
    return colors[Math.floor(Math.random()*colors.length)];
  }

  /* Education */
  var majorsChartData = {
    labels : ["Node","C#","Java","Scala","Python"],
    datasets : [{
        fillColor : getRandomColor(),
        strokeColor : "rgba(220,220,220,1)",
        pointColor : "rgba(220,220,220,1)",
        pointStrokeColor : "#fff",
        labelColor: "white",
        scaleFontSize: "14",
        data : [65,59,90,81,56]
      }]
  };
  var pieData = [{
      value: 30,
      color:"#1ABC9C",
      label: "bachelors",
      labelColor : 'white',
      labelFontSize : '16'
    },
    {
      value : 50,
      color : "#F39C12",
      label: "master",
      labelColor : 'white',
      labelFontSize : '16'
    },
    {
      value : 100,
      color : "#E74C3C",
       label: "phd",
      labelColor : 'white',
      labelFontSize : '16'
  }];

  window.setup.edu = function(apiData) {
    // Setup data

    // majors
    // var majors = apiData.majors;
    // var majorLabels = [];
    // var majorData = [];
    // for (var i in majors) {
    //   majorLabels.push(majors[i].name);
    //   majorData.push(majors[i].count);
    // }
    // majorsChartData.labels = majorLabels;
    // majorsChartData.datasets[0].data = majorData;

    // degrees
    var degrees = apiData.degrees;
    var degreeData = [];
    for (var i in degrees) {
      var degree = degrees[i];
      var slice = {
        value: degree.count,
        color: getRandomColor(),
        label: degree.name,
        labelColor: 'white',
        labelFontSize: '16'
      };
      degreeData.push(slice);
    }
    pieData = degreeData;

    // var mymajors = new Chart(document.getElementById("majors").getContext("2d")).Bar(majorsChartData);
    var myDegrees = new Chart(document.getElementById("degrees").getContext("2d")).Pie(pieData);
  };
});