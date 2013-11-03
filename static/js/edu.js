$(function() {
  function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /* Education */
  var colors = ["#1ABC9C", "#2ECC71", "#3498DB", "#9B59B6", "#34495E", "#F1C40F", "#E67E22", "#E74C3C", "#ECF0F1"];
  var majorsChartData = {
    labels : ["Node","C#","Java","Scala","Python"],
    datasets : [{
        fillColor : colors[getRandom(colors.length, 0)],
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
    console.log(apiData);
    var majors = apiData.majors;

    // Labels
    var majorLabels = [];
    var majorData = [];
    for (var i in majors) {
      majorLabels.push(majors[i].name);
      majorData.push(majors[i].count);
    }
    majorsChartData.labels = majorLabels;
    majorsChartData.datasets[0].data = majorData;

    var mymajors = new Chart(document.getElementById("majors").getContext("2d")).Bar(majorsChartData);
    var myDegrees = new Chart(document.getElementById("degrees").getContext("2d")).Pie(pieData);
  };
});