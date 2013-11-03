function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
var colors = ["#1ABC9C", "#2ECC71", "#3498DB", "#9B59B6", "#34495E", "#F1C40F", "#E67E22", "#E74C3C", "#ECF0F1"];

/* Work */
var skillsChartData = {
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
}
var titlesData = {
  labels : ["Software Engineer","SDE II","TPM","QA"],
  datasets : [{
    fillColor : colors[getRandom(colors.length, 0)],
    strokeColor : "rgba(220,220,220,1)",
    pointColor : "rgba(220,220,220,1)",
    scaleFontSize: "14",
    data : [91,77,50,41]
  }]
}

var myskills = new Chart(document.getElementById("skills").getContext("2d")).Bar(skillsChartData);
var mypie = new Chart(document.getElementById("titles").getContext("2d")).Bar(titlesData);


/* Education */
var colors = ["#1ABC9C", "#2ECC71", "#3498DB", "#9B59B6", "#34495E", "#F1C40F", "#E67E22", "#E74C3C", "#ECF0F1"];
console.log(getRandom(colors.length, 0));
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
}
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

var mymajors = new Chart(document.getElementById("majors").getContext("2d")).Bar(majorsChartData);
var myDegrees = new Chart(document.getElementById("degrees").getContext("2d")).Pie(pieData);