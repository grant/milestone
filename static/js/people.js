$(function() {
	window.clearPeopleData = function() {
		data = [];
	};
	window.addPeopleData = function(people) {
		for (var i in people) {
			var person = people[i];
			data.push({
				name: person.firstName + ' '  + person.lastName,
				match: {
					percent: Math.floor(Math.random()*100),
					color: "#48c9b0",
				},
				profilePic: person.pictureUrl,
				skillProgress: 45,
				skillMarginLeft: 30,
				skills: [
					{name: "Java", type: 'primary'},
					{name: "Scala", type: 'primary'},
					{name: "HTML", type: 'danger'},
					{name: "CSS", type: 'primary'},
					{name: "C++", type: 'danger'},
					{name: "C", type: 'primary'}
				],
				education: {
					university: {name:"University of Washington",type:'primary'},
					major: {name:"Math",type:'danger'},
					degree: {name:"PhD",type:'danger'}
				},
				experienceProgress: 25,
				experienceMarginLeft: 20,
				experience: [
					{position: person.headline, have:"danger"}
				]
			});
		}
	};

	// Get results
	var data = [
		{
			name: "Grant Timmerman",
			match: {
				percent: 84,
				color: "#48c9b0"
			},
			profilePic: "https://scontent-a.xx.fbcdn.net/hphotos-ash3/1075634_531762900206769_1498370310_n.jpg",
			skillProgress: 45,
			skillMarginLeft: 30,
			skills: [
				{name: "Java", type: 'primary'},
				{name: "Scala", type: 'primary'},
				{name: "HTML", type: 'danger'},
				{name: "CSS", type: 'primary'},
				{name: "C++", type: 'danger'},
				{name: "C", type: 'primary'}
			],
			education: {
				university: {name:"University of Washington",type:'danger'},
				major: {name:"Math",type:'danger'},
				degree: {name:"PhD",type:'danger'}
			},
			experienceProgress: 25,
			experienceMarginLeft: 20,
			experience: [
				{company:"Google", position:"Senior Software Engineer", have:"primary"},
				{company:"Yahoo", position:"QA Engineer", have:"danger"},
				{company:"Zynga", position:"Software Engineer in Test", have:"primary"},
				{company:"Groupon", position:"Software Engineer Intern", have:"primary"}
			]
		}
	];

	// Setup mouse/touch events
	var $body = $('.card');
	$body.click(function() {
		throwOutCard(Math.random()>0.5?'left':'right');
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
			var $card = $(getCard()).hide().fadeIn();
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

	$.get('hbs/personCard.hbs', function(data) {
		template = Handlebars.compile(data);
	});

	window.setup.person = function() {
		$('.cards').html('');
		$('.cards').append(getCard());
	};
});