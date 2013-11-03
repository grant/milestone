$(function() {
	// Start
	loadTemplates();
	window.setup = {};// setup functions
	$('.dataContent').hide();

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

	$('.searchButton').click(function() {
		searchApi($('.searchbar').val());
	});

	// Search
	function searchApi(query) {
		// Make API call
		var data = {
			query: query
		};
		if (query && query !== lastQuery) {
			lastQuery = query;
			$.get('/api', data, function(apiData) {
				showResults(apiData);
			});
		}
	}

	function showResults(apiData) {
		// Education
		$('#edu').html(window.templates.edu(apiData));
		// Work
		$('#work').html(window.templates.work(apiData));
		// People
		$('.cards').html(window.templates.personCard(apiData));

		window.setup.edu(apiData);
		window.setup.work(apiData);
		window.setup.person(apiData);
		var curr = $(".curr");
		curr.html($(".searchbar").val());
	}
});