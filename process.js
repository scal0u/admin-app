/////////////////////////
// FUNCTIONS & CLASSES //
/////////////////////////

// Generates a form
function prompt(req) {
	if(!output) output = output_default;
	output = JSON.stringify(req);
	// console.log(output);
};

function Process(n, t, r) {
	this.name = n;
	this.type = t;
	this.reqs = {};

	this.launch = function(relaunch) {

		if(!relaunch) active_processes.push(this);

		// Fetching missing reqs
		for (req in this.reqs) {
			output = output_default;
			if(!this.reqs[req].condition()) {
				this.reqs[req].method();
				break;
			}
		};
		console.log("Message du serveur : "+output);
	};
}

function User(ln, fn, dob) {
	this.last_name = ln;
	this.first_name = fn;
	this.date_of_birth = dob;
}


///////////////
// VARIABLES //
///////////////

output_default = {dialog: "blank"};
output = output_default;
active_processes = [];


var thisUser = new User('Congès');

var inscriptionMaif = new Process("S'inscrire à la MAIF", "subscription");
var vaccination = new Process("Vaccination", "administrative");

vaccination.reqs.height = {condition: function() { return thisUser.height }, method: function() { prompt({name: "height", type: "text", question: "Please enter your height", placeholder: "30cm"})}, promise: function(nv) {thisUser.height = nv} };

inscriptionMaif.reqs.first_name = {condition: function() { return thisUser.first_name }, method: function() { prompt({name: "first_name", type: "text", question: "What is your first name?", placeholder: "E.g. René"})}, promise: function(nv) {thisUser.first_name = nv} };
inscriptionMaif.reqs.date_of_birth = {condition: function() { return thisUser.date_of_birth }, method: function() { prompt({name: "date_of_birth", type: "text", question: "Please enter your birthdate", placeholder: "01/01/1900"})}, promise: function(nv) {thisUser.date_of_birth = nv} };

// Calling another process
inscriptionMaif.reqs.rabbit = {condition: function() { return thisUser.rabbit }, method: function() { vaccination.launch(); }, promise: function(nv) {thisUser.date_of_birth = nv} };


// Launch
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
		for (p in active_processes) {
			
			if(active_processes[p].reqs[message[0].name]) active_processes[p].reqs[message[0].name].promise(message[0].value);
			console.log("Message du client : "+message[0].value);
			
			// Relaunching process
			active_processes[p].launch(true);
			socket.emit('message', output);		

		};
	});	
});

server.listen(8080);