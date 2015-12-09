function Process(n, t, r) {
	this.name = n;
	this.type = t;
	this.requirements = r;
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


var thisUser = new User('Conges', 'Pascal', '19871611');
var inscriptionMaif = new Process("S'inscrire à la MAIF", "subscription", [thisUser.hasFullName(), thisUser.mobile]);