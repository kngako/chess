// Vue.component('main-component', {
//     template: '#loading-content', // TODO: Have a loading screen...
// })

$(document).ready(function(){  
    app = new Vue({
        el: '#app',
        methods: {
            confirmEmail: function (event) {
                console.log("Attempting Resend Confirmation: " + event);
                if(event) {
                    event.preventDefault();
                    
                    console.log("Attempting Resend Confirmation...");
                    // TODO: Validate user input

                    $.get( "/api/resend-confirmation") 
                        .done( function(data) {
                            Materialize.toast("Confirmation resent... check your email tuu.", 4000, 'rounded') // 4000 is the duration of the toast
                        })
                        .fail(function (error) {
                            Materialize.toast(error.statusText, 4000, 'rounded') // 4000 is the duration of the toast
                            console.error(error);
                        });  
                }
                
            }
        },
        data: {
            state: null
        }
    });
});