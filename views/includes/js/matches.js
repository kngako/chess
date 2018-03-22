var selectedMatchDay;

Vue.component('match-day-component', {
    props: ['day', 'user'],
    methods: {
        // TODO: Find a way to call parent functions... maybe I can pass them as props???
        isUserAdmin: function (event) {
            // TODO: Find a more secure role id system...
            var user = this.user;
            for(var i in user.userRoles) {
                var userRole = user.userRoles[i].role.type;
                if(userRole == "admin" || userRole == "superadmin" ) {
                    return true;
                }
            }
            return false;
        },
        openAddBoardForm: function (event) {    
            selectedMatchDay = this.day;

            // var AddBoardComponent = {
            //     methods: {

            //     },
            //     template: '#add-board-template',
            // };

            // app.currentView.MainContent.currentView = AddBoardComponent;

            
            // TODO: Add new thing to the thing...
            $('#match_day_id').val(this.day.id);
            $('#add-board-modal').modal('open');
        }
        // TODO: Might wanna add the function that handles the form here...
    },
    template: '<div class="match-day-wrapper"> ' 
            + '<div class="match-date-header-wrapper center">'
                + '<h4>{{ new Date(day.from).toLocaleTimeString("en-us", {  weekday: "long", year: "numeric", month: "short",  day: "numeric", hour: "2-digit", minute: "2-digit" }) }}</h4>'
                + '<p class="flow-text"> Venue: {{ day.venue }} </p>'
                + '<div class="row">'
                    // + '<div class="col s6">'
                    //     + '<a class="btn">attend</a>'
                    // + '</div>'
                    + '<div class="col s12"  v-if="isUserAdmin()">'
                        + '<a class="btn" v-on:click="openAddBoardForm">add board</a>'
                    + '</div>'
                + '</div>'
            + '</div>'
            
            + '<div class="match-list-wrapper">' // TODO: convert class to board-item-component
                + '<div class="match-board-wrapper" v-for="board in day.boards">'
                    + '<board-item-component v-bind:board=board v-bind:user=user></board-item-component>'
                + '</div>'
            + '</div>'
            
        + '</div>'
})

Vue.component('board-item-component', {
    props: ['board', 'user'],
    methods: {
        // TODO: Find a way to call parent functions... maybe I can pass them as props???
        isUserAdmin: function (event) {
            // TODO: Find a more secure role id system...
            var user = this.user;
            for(var i in user.userRoles) {
                var userRole = user.userRoles[i].role.type;
                if(userRole == "admin" || userRole == "superadmin" ) {
                    return true;
                }
            }
            return false;
        },
        userOwnsBoard: function (event) {
            return false; // TODO: Check if user is admin or user created board...
        },
        deleteBoard: function (event) {  
            // TODO: Show approval popup... 
            var board = this.board;

            var membershipId = this.user.userMemberships[app.state.user.selectedUserMembership].membershipId;
            $.ajax("/api/membership/" + membershipId + "/board/" + board.id,{
                type: "delete"
            })
            .done(function (data) {
                // TODO: Deleted board from day it appears in using vue...
                window.open("/matches", "_self");
            })
            .fail(function(error, payload) {
                console.error("Error: " , error);
                Materialize.toast(error.responseJSON.message, 4000, 'rounded') // 4000 is the duration of the toast
                // Let user know
            });
        }
    },
    template: '<div class="row"> ' 
            + '<div class="col s12">'
                + '<div class="row">'
                    + '<div class="col s12 m10">'
                        + '<h3 class="flow-text truncate tooltipped center" data-position="bottom" data-delay="50" :data-tooltip=board.name> {{ board.name }}</h3>'
                    + '</div>'
                    // TODo; Check user roles...
                    + '<div class="col s12 m2" v-if="isUserAdmin()">'
                        + '<button class="btn" v-on:click="deleteBoard">Delete Board</button>'
                    + '</div>'
                    // + '<div class="col s12">'
                    //     + '<button class="btn">Edit</button>'
                    // + '</div>'
                + '</div>'
            + '</div>'
            // TODO: Add the board-item-component
            + '<div class="match-board-matches-wrapper">'
                + '<div v-for="match in board.matches">'
                    + '<match-item-component v-bind:match=match v-bind:duration=board.duration v-bind:user=user></match-item-component>'
                + '</div>'
            + '</div>'
        + '</div>'
})

Vue.component('match-item-component', {
    props: ['match', 'duration', 'user'], // TODO: Just pass match here...
    template: '<div class="match-item-wrapper z-depth-2" >'
                + '<div class="match-header-wrapper center">'
                    + '<p class="flow-text">{{ duration }} mins match @ {{ new Date(match.time).getHours() + ":" + new Date(match.time).getMinutes() }}</p>'
                + '</div>'
                + '<div class="match-content-wrapper">'
                    + '<match-player-component class="match-champion-wrapper center" v-bind:player=match.champion>' 
                    + '</match-player-component>'
                    
                    + '<div class="match-vs-wrapper center">'
                        + '<p class="flow-text">vs</p>'
                    + '</div>'
                    + '<match-player-component class="match-challenger-wrapper center" v-bind:player=match.challenger>' 
                    + '</match-player-component>'
                + '</div>'
                + '<match-actions-component  class="match-actions-wrapper z-depth-3 center" v-bind:match=match v-bind:user=user>'
                + '</match-actions-component>'
            + '</div>'
})

Vue.component('match-actions-component', {
    props: ['match', 'user'],
    methods: {
        isPlayerActive: function (event) {
            // return false;
            return (this.match.champion != null && this.match.champion.id == this.user.id) 
                || (this.match.challenger != null && this.match.challenger.id == this.user.id) ;
        },
        // TODO: Might wanna have a function to open prompt...
        challengeMatch: function (event) {
            // Post to challenge match...
            var match = this.match;
            console.log("User joining match on: " + match.id);
            // TODO: Might wanna show a prompt?

            // TODO: Close user from seeing this...
            var membershipId = this.user.userMemberships[this.user.selectedUserMembership].membershipId;
            $.post("/api/membership/" + membershipId + "/match/" + match.id + "/challenge")
            .done(function (data) {
                match.champion = data.champion;
                match.challenger = data.challenger;
            })
            .fail(function(error) {
                // TODO: Let user know it failed...
                Materialize.toast(error.responseText, 4000, 'rounded') // 4000 is the duration of the toast
            });
        },
        leaveMatch: function (event) {
            // TODO: Show prompt of living match...
            var match = this.match;
            console.log("User leaving match on: ", match);
            // Execute challenge...s
            
            var membershipId = this.user.userMemberships[this.user.selectedUserMembership].membershipId;
            $.ajax("/api/membership/" + membershipId + "/match/" + match.id + "/challenge",{
                type: "delete"
            })
            .done(function (data) {
                console.log("delete: " , data);
                match.champion = data.champion;
                match.challenger = data.challenger;
            })
            .fail(function(error, payload) {
                console.error("Error: " , error);
                Materialize.toast(error.responseJSON.message, 4000, 'rounded') // 4000 is the duration of the toast
                // Let user know
            });
            
        }
        // TODO: Might wanna add the function that handles the form here...
    },
    template: '<div>'
            + '<a class="btn-flat" v-on:click="leaveMatch" v-if="isPlayerActive()">Leave Match</a>'
            + '<a class="btn-flat" v-on:click="challengeMatch" v-else-if=match.challenger>Challenge Winner</a>'
            + '<a class="btn-flat" v-on:click="challengeMatch" v-else-if=match.champion>Challenge {{ match.champion.firstName }}</a>'
            + '<a class="btn-flat" v-on:click="challengeMatch" v-else>Post Challenge</a>'
        + '</div>'
})


Vue.component('match-player-component', {
    props: ['player'],
    methods: {
        playerName: function () {
            return this.player.firstName + " " + this.player.lastName;
        }
    },
    template: '<div>'
        + '<div v-if="player">'
            + '<h2 class="truncate tooltipped" :data-tooltip="playerName()">{{ player.firstName }}</h2>'
            + '<div class="chip">'
                + '{{ player.level }}'
            + '</div>'
        + '</div>'
        + '<div v-else>'
            + '<h2>?</h2>'
            + '<div class="chip">'
                + 'skill level'
            + '</div>'
        + '</div>'
    + '</div>'
})

$(document).ready(function(){    
    var app = new Vue({
        el: '#app',
        // components: {
        //     'loading-component': LoadingComponent,
        //     'main-component': MainContent,
        // },
        methods: {
            isUserAdmin: function (event) {
                // TODO: Find a more secure role id system...
                console.log("User: ", this.state.user);
                var user = this.state.user;
                for(var i in user.userRoles) {
                    var userRole = user.userRoles[i].role.type;
                    if(userRole == "admin" || userRole == "superadmin" ) {
                        return true;
                    }
                }
                return false;
            },
            postAddBoard: function () {
                // TODO: Create this forms in Vuejs...
                var $boardForm = $("#add-board-form");
                // TODO: Run the required check...
                console.log("Attempting to Send: ", $boardForm.serialize());
                
                if(this.state.user) {
                    var membershipId = this.state.user.userMemberships[this.state.user.selectedUserMembership].membershipId;
                    $.post( "/api/membership/" + membershipId + "/board", $boardForm.serialize())
                    .done(function(data) {
                        // Show result...
                        if(selectedMatchDay["boards"] == null) {
                            selectedMatchDay["boards"] = [];
                        }
                        selectedMatchDay["boards"].push(data);
                        
                        $('#add-board-modal').modal('close');
                        // TODO: Refresh the form especially on other form types...
                        $boardForm.find("input[type=text], textarea").val("");
                    })
                    .fail(function (error) {
                        // Errored...
                        Materialize.toast("Failed to load");
                        console.error("Couldn't get the memberships:", error);
                    }); 
                } else {
                    Materialize.toast("Can't Create new board");
                }
                 
            }
        },
        data: {
            // currentView: LoadingComponent,
            state: null
        }
    });

    $.get( "/api/membership")
    .done( function(data) {
        
        console.log("Match Day Get: ", data);
        // Show result...
        app.state = {
            user: data,
            matchCalendar: [],
            // TODO: Have memberships...
            duration: 10
        }
        data.selectedUserMembership = 0;
        if(data.userMemberships.length > 0) {
            app.state.matchCalendar = data.userMemberships[data.selectedUserMembership].membership.match_days; 
        } else {
            // Show the failed to load stuff here...
            Materialize.toast("Please contact admin to be added into a club membership");
        }

        //app.currentView = MainContent;
        Vue.nextTick(function () {
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
        
      
            // TODO: Create this forms in Vuejs...
            $('#submit-match-day').click(function () {
                // Okay let us post the form...
                var $form = $("#match-day-form");
        
                // TODO: Run the required check...
                console.log("Attempting to Send: ", $form.serialize());
                var membershipId = app.state.user.userMemberships[app.state.user.selectedUserMembership].membershipId;
                $.post( "/api/membership/" + membershipId + "/matchday" , $form.serialize(), function( response, error) {
                    // TODO: Might wanna add the response to the matches...
                    
                    console.log("Match Day Result: ", response);
                    console.error("Error: ", error);
                    // Show result...
        
                    app.state.matchCalendar.push(response);
                    
                    $('#schedule-match-day-form').modal('close');
                    // TODO: Refresh the form
                    $form.find("input[type=text], textarea").val("");
        
                });
            });
        
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
        });

        // Create a function for this...
        
        
    })
    .fail(function (error) {
        // Errored...
        Materialize.toast("Failed to load");
        console.error("Couldn't get the memberships:", error);
    });
});