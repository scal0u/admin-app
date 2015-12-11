output = "";


////////////////////////
// SETTING UP CLASSES //
////////////////////////

function Process(n, t, r) {
	this.name = n;
	this.type = t;
	this.requirements = r;

	this.prompt = function(req) {
		output += JSON.stringify(req);
		console.log(output);
	};

	this.launch = function() {

		// Fetching missing requirements
		for (req in this.requirements) {
			if(!this.requirements[req].look_for) {
				this.prompt(this.requirements[req]);
				break;
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

var thisUser = new User('Conges');
var requirements =
[
	{look_for: thisUser.first_name, name: "first_name", type: "text", question: "What is your first name?", placeholder: "E.g. Robert"},
];
var inscriptionMaif = new Process("S'inscrire à la MAIF", "subscription", requirements);

inscriptionMaif.launch();



/////////////////
// SERVER SIDE //
/////////////////
var http = require('http');

var server = http.createServer(function(req, res) {
  res.writeHead(200);
  res.end(output);
});
server.listen(8080);