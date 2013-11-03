  $(function() {
    var availableTags = [
    "Astronaut",
    "Angel Investor",
    "CEO",
    "Basketball player",
    "Software Developer",
    "Dentist",
	"Registered Nurse",
	"Pharmacist",
	"Computer Systems Analyst",
	"Physician",
	"Database Administrator",
	"Software Developer",
	"Physical Therapist",
	"Web Developer",
	"Dental Hygienist"
    ];
    $( "#name" ).autocomplete({
      source: availableTags
    });
  });