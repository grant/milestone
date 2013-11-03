$(function() {
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
  };
  var titlesData = {
    labels : ["Software Engineer","SDE II","TPM","QA"],
    datasets : [{
      fillColor : colors[getRandom(colors.length, 0)],
      strokeColor : "rgba(220,220,220,1)",
      pointColor : "rgba(220,220,220,1)",
      scaleFontSize: "14",
      data : [91,77,50,41]
    }]
  };

  window.setup.work = function(apiData) {
    var myskills = new Chart(document.getElementById("skills").getContext("2d")).Bar(skillsChartData);
    var mypie = new Chart(document.getElementById("titles").getContext("2d")).Bar(titlesData);
  };
});