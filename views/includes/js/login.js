$(document).ready(function(){  
    app = new Vue({
        el: '#app',
        methods: {
            attemptLogin: function (event) {
                event.preventDefault();

                console.log("Attempting login");
                console.log("Username: " + this.state.username);

                $.post( "/login",$( "#login-form" ).serialize()) // TODO: Could also do a {} post...
                    .done( function(data) {
                        window.open("/matches", "_self");
                    })
                    .fail(function (error) {
                        Materialize.toast("Invalid username or password", 4000, 'rounded') // 4000 is the duration of the toast
                        console.error(error);
                    });  
            }
        },
        data: {
            state: {
                username: '',
                password: ''
            }
        }
    });

    Vue.nextTick(function () {
        $('ul.tabs').tabs({
            swipable: true
        });
    
        $('.modal').modal({
            dismissible: false, // Modal can be dismissed by clicking outside of the modal
            
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
                //alert("Ready");
                console.log(modal, trigger);
            },
            complete: function() { 
                //alert('Closed'); 
            } // Callback for Modal close
        });
    });
});