$(document).ready(function(){  
    app = new Vue({
        el: '#app',
        methods: {
            attemptSignup: function (event) {
                event.preventDefault();

                console.log("Attempting signup");
                // TODO: Validate user input

                $.post( "/signup",$( "#signup-form" ).serialize()) 
                    .done( function(data) {
                        window.open("/matches", "_self");
                    })
                    .fail(function (error) {
                        Materialize.toast(error.statusText, 4000, 'rounded') // 4000 is the duration of the toast
                        console.error(error);
                    });  
            }
        },
        data: {
            state: null
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
            }
        );
    })
});