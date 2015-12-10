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
		for (x in this.requirements) {
			if(!this.requirements[x]) console.log("Please enter your "+x+" below:");

			// NodeJS prompt
			prompt.get(['x'], function (err, result) {
				if (err) { return onErr(err); }
				thisUser.date_of_birth = result.x;
				console.log(thisUser.date_of_birth);
			});
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
var inscriptionMaif = new Process("S'inscrire à la MAIF", "subscription", {"first name":thisUser.first_name, "date of birth":thisUser.mobile});

inscriptionMaif.launch();