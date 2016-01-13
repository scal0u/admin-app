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
	if(obj) {
		this.name = obj.name;
		this.type = obj.type;
		this.steps = obj.steps;
		this.promises = obj.promises;
	} 

	this.launch = function() {

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

myFirebaseRef.child("models/processes").on("value", function(snapshot) {
 	var obj = snapshot.val();
	global["getInsurance"] = new Process(obj.getInsurance);
	global["vaccination"] = new Process(obj.vaccination);
	global["voyageGuyane"] = new Process(obj.voyageGuyane);
	// Launch
	voyageGuyane.launch();
});

thisUser = new User('Congès');


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