output_default = {dialog: "Thank you."};
output = output_default;

// Generates a form
function prompt(req) {
	output = JSON.stringify(req);
	// console.log(output);
};


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
			output = output_default;
			if(!this.requirements[req].condition()) {
				this.requirements[req].method();
				break;
			}
		};
		console.log(output);
	};
}

function User(ln, fn, dob) {
	this.last_name = ln;
	this.first_name = fn;
	this.date_of_birth = dob;

	this.has = function(property) {
		if(!this[property]) return false;
		else return true;
	};
}


///////////////
// VARIABLES //
///////////////

var thisUser = new User('Conges');
var requirements =
{
	// "first_name": {condition: function() { return thisUser.first_name }, method: function() { prompt({name: "first_name", type: "text", question: "What is your first name?", placeholder: "E.g. René"})}, promise: function(nv) {thisUser.first_name = nv} },
	// "date_of_birth": {condition: function() {return thisUser.date_of_birth }, method: function() { prompt({name: "date_of_birth", type: "text", question: "Please enter your birthdate", placeholder: "01/01/1900"})}, promise: function(nv) {thisUser.date_of_birth = nv} },
	// "rabbit": {condition: function() { return thisUser.rabbit }, method: function() { prompt({name: "rabbit", type: "text", question: "Please enter your rabbit", placeholder: "rabbit's name"})}, promise: function(nv) {thisUser.rabbit = nv} },
};
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

// Chargement de socket.io
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    console.log('Un client est connecté !');
    socket.emit('message', output);
	

	// On message reception:
	socket.on('message', function (message) {
		// DIRTY CODE
		// Completing requirement (sauf qu'en fait ça devrait changer la valeur originale)
		inscriptionMaif.requirements[message[0].name].promise(message[0].value);
		console.log(message[0].value);
		
		// Relaunching process
		inscriptionMaif.launch();
		socket.emit('message', output);		
	});	
});

server.listen(8080);