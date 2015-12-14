output = "";

// Generates a form
function prompt(req) {
	output = JSON.stringify(req);
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
			if(!this.requirements[req].condition) {
				this.requirements[req].method;
				break;
			}
		};
	};
}

function User(ln, fn, dob) {
	this.last_name = ln;
	this.first_name = fn;
	this.date_of_birth = dob;

	this.has = function(property) {
		if(this.property) return true;
		else return false;
	};
}


///////////////
// VARIABLES //
///////////////

var thisUser = new User('Conges');
var requirements =
{
	"first_name": {condition: thisUser.has("first_name"), method: prompt({name: "first_name", type: "text", question: "What is your first name?", placeholder: "E.g. René"})},
	"date_of_birth": {condition: thisUser.has("date_of_birth"), method: prompt({name: "date_of_birth", type: "text", question: "Please enter your birthdate", placeholder: "01/01/1900"})},
	"rabbit": {condition: thisUser.has("rabbit"), method: prompt({name: "rabbit", type: "text", question: "Please enter your rabbit", placeholder: "rabbit's name"})},
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
		// Completing requirement (sauf qu'en fait ça devrait changer la valeur originale puis re-checker)
		inscriptionMaif.requirements[message[0].name].condition = message[0].value;
		console.log(message[0].value);
		
		// Relaunching process
		inscriptionMaif.launch();
		socket.emit('message', output);		
	});	
});

console.log(output);

server.listen(8080);