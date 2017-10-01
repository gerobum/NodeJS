Template.mainLayout.events({
    "click .logout": function(event, template) {
		Meteor.logout();
	}
});

