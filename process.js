/////////////////////////
// FUNCTIONS & CLASSES //
/////////////////////////

// Generates a form
function prompt(req) {
	if(!output) output = output_default;
	output = JSON.stringify(req);
};

function Process(n, t, r) {
	this.name = n;
	this.type = t;
	this.reqs = {};
	this.promise = function() {};
	processes.push(this);

	this.launch = function() {

		this.active = true;
		console.log(this.name+' is now active');			

		// Fetching missing reqs
		for (req in this.reqs) {
			output = output_default;

			// If condition is not fulfilled 
			if(!this.reqs[req].condition()) {
				// Let's fulfill it
				this.reqs[req].method();
				break;
			}
		};
		if(output == output_default) {
			output = {dialog: this.name+" was fulfilled"};
			this.active = false;
			this.promise();
			console.log(this.name+' is now inactive');
		}
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
processes = [];


var thisUser = new User('Congès');
// thisUser.vaccinated = true;

var inscriptionMaif = new Process("S'inscrire à la MAIF", "subscription");
var vaccination = new Process("Vaccination", "administrative");

vaccination.reqs.height = {condition: function() { return thisUser.height }, method: function() { prompt({name: "height", type: "text", question: "Please enter your height", placeholder: "30cm"})}, promise: function(nv) { thisUser.height = nv; inscriptionMaif.launch(); } };
vaccination.promise = function() { thisUser.vaccinated = true; inscriptionMaif.launch() };

inscriptionMaif.reqs.first_name = {condition: function() { return thisUser.first_name }, method: function() { prompt({name: "first_name", type: "text", question: "What is your first name?", placeholder: "E.g. René"})}, promise: function(nv) {thisUser.first_name = nv} };
// Calling another process
inscriptionMaif.reqs.vaccinated = {condition: function() { return thisUser.vaccinated }, method: function() {  inscriptionMaif.active = false; vaccination.launch(); } };
inscriptionMaif.reqs.date_of_birth = {condition: function() { return thisUser.date_of_birth }, method: function() { prompt({name: "date_of_birth", type: "text", question: "Please enter your birthdate", placeholder: "01/01/1900"})}, promise: function(nv) {thisUser.date_of_birth = nv} };



// Launch
inscriptionMaif.launch();


/////////////////
// SERVER SIDE //
/////////////////
var http = require('http');

var server = http.createServer(function(req, res) {
	res.writeHead(200);
	res.end(output);
	console.log(output);
});

// Chargement de socket.io
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    console.log('Un client est connecté !');
    socket.emit('message', output);
	

	// On message reception:
	socket.on('message', function (message) {
		for (p in processes) {
			
			if(processes[p].active) {			
				if(processes[p].reqs[message[0].name]) processes[p].reqs[message[0].name].promise(message[0].value);
				console.log("Message du client : "+message[0].value);
				
				// Relaunching process
				processes[p].launch();

				break;
			}

		};
		socket.emit('message', output);		
	});	
});

server.listen(8080);