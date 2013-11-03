$(function() {

	// Get results
	var data = [
		{
			name: "Grant Timmerman",
			matchPercent: 84,
			match: {
				percent: 84,
				color: "#48c9b0"
			},
			profilePic: "https://scontent-a.xx.fbcdn.net/hphotos-ash3/1075634_531762900206769_1498370310_n.jpg",
			skillProgress: 45,
			skillMarginLeft: 30,
			skills: [
				{name: "Java", have: true},
				{name: "Scala", have: true},
				{name: "HTML", have: false},
				{name: "CSS", have: true},
				{name: "C++", have: false},
				{name: "C", have: true}
			],
			education: {
				university: {name:"University of Washington",have:false},
				major: {name:"Math",have:false},
				degree: {name:"PhD",have:false}
			},
			experienceProgress: 25,
			experienceMarginLeft: 20,
			experience: [
				{company:"Google", position:"Senior Software Engineer"},
				{company:"Yahoo", position:"QA Engineer"},
				{company:"Zynga", position:"Software Engineer in Test"},
				{company:"Groupon", position:"Software Engineer Intern"}
			]
		}
	];

	// Setup mouse/touch events
	var $body = $('body');
	$body.click(function() {
		throwOutCard('right');
	});
	Hammer($body).on("swipeleft", function() {
		throwOutCard('left');
	});
	Hammer($body).on("swiperight", function() {
		throwOutCard('right');
	});

	// Throws out the card
	var throwOutSpeed = 400;
	var throwOutDistance = '300px';
	var throwing = false;
	function throwOutCard(direction) {
		if (!throwing) {
			// Add new card underneath
			var $oldCard = $('.card:last');
			var $card = getCard();
			$('.cards').prepend($card);

			// Throw out card
			throwing = true;
			var throwOutProps = {
				opacity: 0,
				marginLeft: (direction === 'right') ? throwOutDistance : '-' + throwOutDistance
			};
			var rotateName = 'rotate' + direction;
			$oldCard.addClass('rotate' + direction).animate(throwOutProps, throwOutSpeed, function () {
				throwing = false;
				$(this).remove();
			});
		}
	}

	var cardIndex = 0;
	function getCard() {
		if (cardIndex === data.length) {
			cardIndex = 0;
		}
		var personData = data[cardIndex];
		++cardIndex;
		return template(personData);
	}

	var template;
	$.get('./static/hbs/personCard.hbs', function(data) {
		template = Handlebars.compile(data);
		$('.cards').append(getCard());
	});
});