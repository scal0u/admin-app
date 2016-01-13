/////////////////////////
// FUNCTIONS & CLASSES //
/////////////////////////

var webdriverio = require('webdriverio');
var options = { desiredCapabilities: { browserName: 'firefox' } };
var client = webdriverio.remote(options);
 
// client
//     .init()
//     .url('https://duckduckgo.com/')
//     .setValue('#search_form_input_homepage', 'WebdriverIO')
//     .click('#search_button_homepage')
//     .getTitle().then(function(title) {
//         console.log('Title is: ' + title);
//         // outputs: "Title is: WebdriverIO (Software) at DuckDuckGo"
//     })
//     .end();


// Generates a form
function prompt(q) {
	if(!output) output = output_default;
	output = JSON.stringify(q);
};

function Process(obj) {
	this.steps = {};
	this.promise = function() {};
	if(obj) this = obj;

	this.launch = function() {

		console.log("Parent process: "+this.parent_process);

		this.active = true;

		// Fetching missing steps
		for (step in this.steps) {
			output = output_default;

			// If step condition is not fulfilled 
			if(this.steps[step].condition.type == "user_data") {
				if(!thisUser[this.steps[step].condition.value]) {
					// We apply step method
					if(this.steps[step].method.type == "prompt") prompt(this.steps[step].method.value);
					else if(this.steps[step].method.type == "switch_process") {
						this.active = false;
						global[this.steps[step].method.value].parent_process = this;
						global[this.steps[step].method.value].launch();
					}
					break;
				}
			}
		};
		// If output hasn't changed (meaning all steps are fulfilled)
		if(output == output_default) { // Process is complete!
			for(promise in this.promises) if(this.promises[promise].type == "user_update") thisUser[this.promises[promise].key] = this.promises[promise].value;
			output = {dialog: "<h2>Thank you.</h2> Process <b>"+ this.name+"</b> is now complete"}; // Inform user
			this.active = false; // Deactivate process
			// this.promise(); // Running process' promise
			if(this.parent_process) this.parent_process.launch();
		}
	};
	
	processes.push(this);
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

var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://boiling-torch-1466.firebaseio.com/");

myFirebaseRef.child("models/processes/vaccination").set({
	name: "Vaccination",
	type: "administrative",
	steps: {
		getName: {
			condition: "thisUser.first_name",
			method: "prompt",
			prompt: {name: "first_name", type: "text", question: "What is your first name?", placeholder: "E.g. René"}
		},
	}
});

myFirebaseRef.child("models/processes/vaccination/type").on("value", function(snapshot) {
 	console.log(snapshot.val());
});

thisUser = new User('Congès');

voyageGuyane = new Process();
voyageGuyane.name = "Voyage en Guyane";
voyageGuyane.type = "travel";
voyageGuyane.steps.first_name = {condition: {type: "user_data", value: "first_name" }, method: {type: "prompt", value: {name: "first_name", type: "text", question: "What is your first name?", placeholder: "E.g. René"}}, promises: [ {type: "user_update", key: "first_name"} ] };
voyageGuyane.steps.vaccinated = {condition: {type: "user_data", value: "vaccinated" }, method: {type: "switch_process", value: "vaccination"} };
voyageGuyane.steps.insured = {condition: {type: "user_data", value: "insured" }, method: {type: "switch_process", value: "getInsurance"} };
voyageGuyane.steps.date_of_birth = {condition: {type: "user_data", value: "date_of_birth" }, method: {type: "prompt", value: {name: "date_of_birth", type: "text", question: "Please enter your birthdate", placeholder: "01/01/1900"}}, promises: [ {type: "user_update", key: "date_of_birth"} ] };

getInsurance = new Process();
getInsurance.name = "S'inscrire à la MAIF";
getInsurance.type = "subscription";
getInsurance.steps.date_of_birth = {condition: {type: "user_data", value: "date_of_birth" }, method: {type: "prompt", value: {name: "date_of_birth", type: "text", question: "Please enter your birthdate", placeholder: "E.g. 01/01/1900"}}, promises: [ {type: "user_update", key: "date_of_birth"} ] };
getInsurance.steps.ni_number = {condition: {type: "user_data", value: "ni_number" }, method: {type: "prompt", value: {name: "ni_number", type: "text", question: "Please enter your National Insurance Number", placeholder: "Your number"}}, promises: [ {type: "user_update", key: "ni_number"} ] };
getInsurance.promises = [ {type: "user_update", key: "insured", value: true} ];

vaccination = new Process();
vaccination.name = "Vaccination";
vaccination.type = "administrative";
vaccination.steps.height = {condition: {type: "user_data", value: "height" }, method: {type: "prompt", value: {name: "height", type: "text", question: "Please enter your height", placeholder: "130cm"}}, promises: [ {type: "user_update", key: "height" } ] };
vaccination.steps.weight = {condition: {type: "user_data", value: "weight" }, method: {type: "prompt", value: {name: "weight", type: "text", question: "Please enter your weight", placeholder: "25kg"}}, promises: [ {type: "user_update", key: "weight" } ] };
vaccination.promises = [ {type: "user_update", key: "vaccinated", value: true} ];


// Launch
voyageGuyane.launch();


////////////
// SERVER //
////////////
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
				if(processes[p].steps[message[0].name]) {
					for(promise in processes[p].steps[message[0].name].promises) {
						if (promise.type = "user_update") thisUser[processes[p].steps[message[0].name].promises[promise].key] = message[0].value;
					}
				}
				processes[p].launch();
				break;
			}
		};
		socket.emit('message', output);		
	});	
});

server.listen(8080);