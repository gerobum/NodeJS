Meteor.publish("allPostHeaders", function(){
    return Posts.find({}, {
        fields: {content: 0}
    });
});


