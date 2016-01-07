/////////////////////////
// FUNCTIONS & CLASSES //
/////////////////////////

var webdriverio = require('webdriverio');
var options = { desiredCapabilities: { browserName: 'firefox' } };
var client = webdriverio.remote(options);
 
client
    .init()
    .url('https://duckduckgo.com/')
    .setValue('#search_form_input_homepage', 'WebdriverIO')
    .click('#search_button_homepage')
    .getTitle().then(function(title) {
        console.log('Title is: ' + title);
        // outputs: "Title is: WebdriverIO (Software) at DuckDuckGo"
    })
    .end();


// Generates a form
function prompt(q) {
	if(!output) output = output_default;
	output = JSON.stringify(q);
};

function Process(n, t, r) {
	this.name = n;
	this.type = t;
	this.steps = {};
	this.promise = function() {};
	processes.push(this);

	this.launch = function() {

		this.active = true;

		// Fetching missing steps
		for (step in this.steps) {
			output = output_default;

			// If step condition is not fulfilled 
			if(!this.steps[step].condition()) {
				// We apply step method
				this.steps[step].method();
				break;
			}
		};
		// If output hasn't changed (meaning all steps are fulfilled)
		if(output == output_default) { // Process is complete!
			output = {dialog: "Process <b>"+ this.name+"</b> is now complete"}; // Inform user
			this.active = false; // Deactivate process
			this.promise(); // Running process' promise
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

var voyageGuyane = new Process("Voyage en Guyane", "travel");
voyageGuyane.steps.first_name = {condition: function() { return thisUser.first_name }, method: function() { prompt({name: "first_name", type: "text", question: "What is your first name?", placeholder: "E.g. René"})}, promise: function(nv) {thisUser.first_name = nv} };
voyageGuyane.steps.vaccinated = {condition: function() { return thisUser.vaccinated }, method: function() {  voyageGuyane.active = false; vaccination.launch(); } };
voyageGuyane.steps.insured = {condition: function() { return thisUser.insured }, method: function() {  voyageGuyane.active = false; getInsurance.launch(); } };
voyageGuyane.steps.date_of_birth = {condition: function() { return thisUser.date_of_birth }, method: function() { prompt({name: "date_of_birth", type: "text", question: "Please enter your birthdate", placeholder: "01/01/1900"})}, promise: function(nv) {thisUser.date_of_birth = nv} };

var getInsurance = new Process("S'inscrire à la MAIF", "subscription");
getInsurance.steps.date_of_birth = {condition: function() { return thisUser.date_of_birth }, method: function() { prompt({name: "date_of_birth", type: "text", question: "Please enter your birthdate", placeholder: "E.g. 01/01/1900"})}, promise: function(nv) {thisUser.date_of_birth = nv} };
getInsurance.steps.NInumber = {condition: function() { return thisUser.NInumber }, method: function() { prompt({name: "NInumber", type: "text", question: "Please enter your National Insurance Number", placeholder: "Your number"})}, promise: function(nv) {thisUser.NInumber = nv} };
getInsurance.promise = function() { thisUser.insured = true; voyageGuyane.launch() };

var vaccination = new Process("Vaccination", "administrative");
vaccination.steps.height = {condition: function() { return thisUser.height }, method: function() { prompt({name: "height", type: "text", question: "Please enter your height", placeholder: "130cm"})}, promise: function(nv) { thisUser.height = nv; } };
vaccination.steps.weight = {condition: function() { return thisUser.weight }, method: function() { prompt({name: "weight", type: "text", question: "Please enter your weight", placeholder: "25kg"})}, promise: function(nv) { thisUser.weight = nv; } };
vaccination.promise = function() { thisUser.vaccinated = true; voyageGuyane.launch() };


// Launch
voyageGuyane.launch();


/////////////////
// SERVER SIDE //
/////////////////
var http = require('http');
var server = http.createServer(function(req, res) {
	res.writeHead(200);
	res.end(output);
	console.log(output);
});

// SOCKET.IO
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    // console.log('Visitor online!');
    socket.emit('message', output);
	// On message reception:
	socket.on('message', function (message) {
		for (p in processes) {
			if(processes[p].active) {			
				if(processes[p].steps[message[0].name]) processes[p].steps[message[0].name].promise(message[0].value);
				processes[p].launch();
				break;
			}
		};
		socket.emit('message', output);		
	});	
});

server.listen(8080);