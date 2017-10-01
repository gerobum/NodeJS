Accounts.validateNewUser(function(user) {
    // L'adresse email est-elle valide ?
	if (
		// Ne fonctionne pas pour tout, mais relativement précise
		/^[a-zA-Z][a-zA-Z0-9_-]+[a-zA-Z0-9]@([a-zA-Z][a-zA-Z0-9-]+\.)+[a-zA-Z]{2,3}$/
		.test(user.emails[0].address)
	) {
		return true;
	} else {
		throw new Meteor.Error(500, "Veuillez donner une adresse email valide");
	}
});
