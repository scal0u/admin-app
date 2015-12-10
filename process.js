// Prompt NodeJS library requirements
var prompt = require('prompt');
prompt.start();


////////////////////////
// SETTING UP CLASSES //
////////////////////////

function Process(n, t, r) {
	this.name = n;
	this.type = t;
	this.requirements = r;

	this.launch = function() {

		// Fetching missing requirements
		for (req in this.requirements) {
			if(!this.requirements[req]) {
				// NodeJS prompt
				prompt.get([req], function (err, result) {
					if (err) { return onErr(err); }
					thisUser.date_of_birth = result.req;
					console.log("\n\nThank you.");
				});
			}

		};
	};
}


function User(ln, fn, dob) {
	this.last_name = ln;
	this.first_name = fn;
	this.date_of_birth = dob;

	this.hasFullName = function() {
		if(this.first_name && this.last_name) return true;
		else return false;
	};
}


///////////////
// VARIABLES //
///////////////

var thisUser = new User('Conges', 'Pascal');
var requirements = {"first name":thisUser.first_name, "date of birth":thisUser.date_of_birth};
var inscriptionMaif = new Process("S'inscrire à la MAIF", "subscription", requirements);

inscriptionMaif.launch();