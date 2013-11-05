$(function() {
	// Start
	loadTemplates();
	window.setup = {};// setup functions
	$('.dataContent').hide();
  // $(".searchArea").show();

	function loadTemplates() {
		window.templates = {};

		// Education
		$.get('hbs/edu.hbs', function(data) {
			window.templates.edu = Handlebars.compile(data);
		});

		// Work
		$.get('hbs/work.hbs', function(data) {
			window.templates.work = Handlebars.compile(data);
		});

		// People
		$.get('hbs/personCard.hbs', function(data) {
			window.templates.personCard = Handlebars.compile(data);
		});
	}

	// Search bar
	var lastQuery = '';
	$('.searchbar').click(function() {
		// Remove headers
		var fadeTime = 300;
		$('.homeHeader').fadeOut(fadeTime, function() {
			$(this).remove();
		});
		$('.searchbarHeader').fadeOut(fadeTime, function() {
			$(this).remove();
			$('.dataContent').fadeIn();
		});



		// Scroll search to top
		$('.searchArea').animate({
			top: 0
		}, fadeTime);
	}).change(function () {
		searchApi($(this).val());
	});

	$(".emergency-wrapper").click(function() {
		searchApi($('.searchbar').val());
	});

	$('.searchButton').click(function() {
		searchApi($('.searchbar').val());
	});

	// Search
	function searchApi(query) {
		// Make API call
		var curr = $(".curr");
		curr.html($(".searchbar").val());
		
		var data = {
			query: query
		};
		if (query && query !== lastQuery) {
			lastQuery = query;
			$.get('/api', data, function(apiData) {
				showResults(apiData);
			});
		}

		IN.API.PeopleSearch()
        .fields("id", "firstName", "lastName", "headline", "industry", "positions", "picture-url", "summary")
        .params({
          "title": $('.searchbar').val(),
          "count": 3
        })
        .result(function(result, metadata) {
        	window.clearPeopleData();
        	window.addPeopleData(result.people.values);
        	window.setup.person();
        	setTimeout(function () { window.setup.person(); }, 5000);
        });
	}

	function fixData(apiData) {
		//majors
		var maxmajorCount = 0;
		for (var i in apiData.majors) {
			maxmajorCount = Math.max(maxmajorCount, apiData.majors[i].count);
		}
		for (var i in apiData.majors) {
			apiData.majors[i].percent = (apiData.majors[i].count / maxmajorCount) * 100;
		}

		//skill
		var maxskillCount = 0;
		for (var i in apiData.skills) {
			maxskillCount = Math.max(maxskillCount, apiData.skills[i].count);
		}
		for (var i in apiData.skills) {
			apiData.skills[i].percent = (apiData.skills[i].count / maxskillCount) * 100;
		}

		//title
		var maxTitleCount = 0;
		for (var i in apiData.titles) {
			maxTitleCount = Math.max(maxTitleCount, apiData.titles[i].count);
		}
		for (var i in apiData.titles) {
			apiData.titles[i].percent = (apiData.titles[i].count / maxTitleCount) * 100;
		}

		return apiData;
	}

	function showResults(apiData) {
		apiData = fixData(apiData);
		// Education
		$('#edu').html(window.templates.edu(apiData));
		// Work
		$('#work').html(window.templates.work(apiData));
		// People
		$('.cards').html(window.templates.personCard(apiData));

		window.setup.edu(apiData);
		// window.setup.work(apiData);
		// window.setup.person(apiData);
		var curr = $(".curr");
		curr.html($(".searchbar").val());
	}
});