// Vue.component('main-component', {
//     template: '#loading-content', // TODO: Have a loading screen...
// })

$(document).ready(function(){  
    app = new Vue({
        el: '#app',
        components: {
            'loading-component': LoadingComponent,
            'main-component': MainContent,
        },
        data: {
            currentView: LoadingComponent,
            navigation: navigation,
            state: null
        }
    });

    $.get( "content.html")
        .done(function (content) {
            MainContent.template = content;
            app.currentView = MainContent;

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
            })        
        })
        .fail(function(error) {
            // TODO: Let user know it failed...
            app.currentView = PageLoadFailContent;
            //Materialize.toast("Failed to load page...", 4000, 'rounded') // 4000 is the duration of the toast
        });
});