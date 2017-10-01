Template.post.helpers({

    setAuthor: function(){

        return '<b>Bibi</b>';

    }

});
Template.register.events({
    "submit form": function(e, template) {
		e.preventDefault();

		var username = $('input[name="username"]').val();
		var email = $('input[name="email"]').val();
		var password = $('input[name="password"]').val();
		var profile = {
    	    // Vous pouvez mettre ici le contenu d'éventuels champs optionnels, comme le prénom, nom, etc.   
		};

		var user = {
			username: username,
			email: email,
			password: password,
			profile: profile
		};

		Accounts.createUser(user, function(err) { // Mais quelle est donc cette méthode mystère ?...
			if (err) {
				alert(err.reason)
			} else {
				Router.go('home'); // Ceci est une redirection depuis un event/helper, elle est basée sur le nom de la route
			}
		});
	}
});
Template.login.events({
    "submit form": function(event, template) {
		event.preventDefault();

		var user = $("input[name='username']").val();
		var password = $("input[name='password']").val();

		// Cas 1 : Login en utilisant le nom d'utilisateur
		Meteor.loginWithPassword({
			username: user
		}, password, function(err) {
			if (err) {
				alert(err.reason)
			}
		});

		// Cas 2 : Login en utilisant l'email
		Meteor.loginWithPassword({
			email: user
		}, password, function(err) {
			if (err) {
				alert(err.reason)
			}
		});

		// Cas 3 : Login en utilisant le nom d'utilisateur ou l'email
		Meteor.loginWithPassword(
			user,
			password,
			function(err) {
				if (err) {
					alert(err.reason)
				}
			}
		);
	}
});
