var MainContent = {
    template: '<div class="center">Failed to load content...</div>' // 
}

var PageLoadFailContent = {
    template: '<div class="container"><h1 class="center">404</h1></div>' // 
}

var LoadingComponent = {
    template: '#loading-content'
}

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

$('.tooltipped').tooltip({delay: 50});

$('.timepicker').pickatime({
    default: 'now', // Set default time: 'now', '1:30AM', '16:30'
    fromnow: 10000,       // set default time to * milliseconds from now (using with default = 'now')
    twelvehour: false, // Use AM/PM or 24-hour format
    donetext: 'SET TIME', // text for done-button
    cleartext: 'Clear', // text for clear-button
    canceltext: 'Cancel', // Text for cancel-button
    autoclose: true, // automatic close timepicker
    //ampmclickable: true, // make AM PM clickable
    aftershow: function(){} //Function for after opening timepicker
});

$('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 2, // Creates a dropdown of 15 years to control year,
    today: 'Today',
    clear: 'Clear',
    close: 'Ok',
    closeOnSelect: true // Close upon selecting a date,
});