function Process(n, t, r) {
	this.name = n;
	this.type = t;
	this.requirements = r;

	this.launch = function() {
		for (x in this.requirements) {
			if(!this.requirements[x]) console.log("Please enter your "+x+" below:");
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


var thisUser = new User('Conges', 'Pascal');
var inscriptionMaif = new Process("S'inscrire à la MAIF", "subscription", {"first name":thisUser.first_name, "date of birth":thisUser.mobile});

inscriptionMaif.launch();