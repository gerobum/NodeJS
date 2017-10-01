Router.configure({
    layoutTemplate: 'mainLayout'
});

Router.route('/', {
    name: "home",
    data: function(){
        var posts = Posts.find();

        return {
            posts: posts
        };
    },

    waitOn: function(){
        return Meteor.subscribe("allPostHeaders");
    }
});

Router.route('/login', {
    name: "login"
});


Router.route('/register/', {
    name: "register"
});

Router.route('/posts', {
    name: "posts",
    data: function(){
		return {
            posts: [
                {
                    title: "Premier post",
                    hide: false
                },
                {
                    title: "Second post",
                    hide: false
                },
                {
                    title: "Troisième post",
                    hide: false
                },
            ]
        };
	}
});

Router.route('/add/:_id1/:_id2', {
    name: "add",
    template: "calc",
    data: function(){    
        var num1 = parseInt(this.params._id1);
        var num2 = parseInt(this.params._id2);
        var sum = num1 + num2;
        return {
            num1: num1,  
             op: '+',
            num2: num2,   
            sum:  sum
        }
    }
});
Router.route('/sub/:_id1/:_id2', {
    name: "sub",
    template: "calc",
    data: function(){    
        var num1 = parseInt(this.params._id1);
        var num2 = parseInt(this.params._id2);
        var sum = num1 - num2;
        return {
            num1: num1,   
             op: '-',
            num2: num2,   
            sum:  sum
        }
    }
});
