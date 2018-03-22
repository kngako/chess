var selectedMatchDay;

Vue.component('match-day-component', {
    props: ['day', 'user'],
    methods: {
        hasMatchResults: function (event) {
            return this.day.boards.length != 0;
        },
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
            + '</div>'

            + '<div v-if="hasMatchResults()">'
                + '<div class="match-list-wrapper">' // TODO: convert class to board-item-component
                    + '<div class="match-board-wrapper" v-for="board in day.boards">'
                        + '<board-item-component v-bind:board=board v-bind:user=user></board-item-component>'
                    + '</div>'
                + '</div>'
            + '</div>'
            + '<div class="center" v-else>'
                + '<p class="flow-text">This match day didn\'t have enough participants.</p>'
            + '</div>'
            
        + '</div>'
})

Vue.component('board-item-component', {
    props: ['board', 'user'],
    methods: {
        // TODO: Make this a mixin functions... maybe I can pass them as props???
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

            $.ajax("/api/board/" + board.id,{
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
                    + '<match-result-component v-bind:match=match v-bind:duration=board.duration v-bind:user=user></match-result-component>'
                + '</div>'
            + '</div>'
            
        + '</div>'
})

Vue.component('match-result-component', {
    props: ['match', 'duration', 'user'], // TODO: Just pass match here...
    methods: {
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
        }
    },
    template: '<div class="match-item-wrapper z-depth-2" >'
                + '<div class="match-header-wrapper center">'
                    + '<p class="flow-text">{{ duration }} mins match @ {{ new Date(match.time).getHours() + ":" + new Date(match.time).getMinutes() }}</p>'
                + '</div>'
                + '<div class="match-content-wrapper">'
                    + '<match-player-component class="match-champion-wrapper center" v-bind:player=match.champion  v-bind:result=match.result>' 
                    + '</match-player-component>'
                    
                    + '<div class="match-vs-wrapper center">'
                        + '<p class="flow-text">vs</p>'
                    + '</div>'
                    + '<match-player-component class="match-challenger-wrapper center" v-bind:player=match.challenger v-bind:result=match.result>' 
                    + '</match-player-component>'
                + '</div>'
                + '<match-actions-component  class="match-actions-wrapper z-depth-3 center" v-bind:match=match v-bind:user=user v-if="isUserAdmin()">'
                + '</match-actions-component>'
            + '</div>'
})

Vue.component('match-actions-component', {
    props: ['match', 'user'],
    methods: {
        noResult: function (event) {
            // return false;
            return this.match.result == null;
        },
        matchDraw: function (event) {
            // return false;
            return this.setWinner(-1);
        },
        matchChampionWinner: function (event) {
            // return false;
            return this.setWinner(this.match.champion.id);
        },
        matchChallengerWinner: function (event) {
            // return false;
            return this.setWinner(this.match.challenger.id);
        },
        setWinner: function (winnerId) {
            // var match = this.match;
            // TODO: Might wanna show a prompt?

            var membershipId = this.user.userMemberships[this.user.selectedUserMembership].membershipId;
            $.post("/api/membership/" + membershipId + "/match/" + this.match.id + "/result", {
                winnerId: winnerId
            })
            .done(function (data) {
                // TODO: don't be too lazy to feed the data into the result...
                // this.match.result = data;
                window.open("/match-result", "_self");
            })
            .fail(function(error) {
                // TODO: Let user know it failed...
                Materialize.toast(error.responseText, 4000, 'rounded') // 4000 is the duration of the toast
            });
        },
        deleteResult: function () {
            // return false;
            var membershipId = this.user.userMemberships[this.user.selectedUserMembership].membershipId;
            $.ajax("/api/membership/" + membershipId + "/match/" + this.match.id + "/result", {
                type: "delete"
            })
            .done(function (data) {
                // TODO: Deleted board from day it appears in using vue...
                window.open("/match-result", "_self");
            })
            .fail(function(error, payload) {
                console.error("Error: " , error);
                Materialize.toast(error.responseJSON.message, 4000, 'rounded') // 4000 is the duration of the toast
                // Let user know
            });
        }
    },
    template: '<div>'
            + '<div v-if="noResult()">'
                + '<a class="btn-flat" v-on:click="matchChampionWinner()">{{ match.champion.firstName }} wins</a>'
                + '<a class="btn-flat" v-on:click="matchDraw()" >issa draw</a>'
                + '<a class="btn-flat" v-on:click="matchChallengerWinner()">{{ match.challenger.firstName }} wins</a>'
            + '</div>'
            + '<div v-else>'
            
                + '<a class="btn-flat" v-on:click="deleteResult()">Delete Result</a>'
            + '</div>'
        + '</div>'
})

Vue.component('match-player-component', {
    props: ['player', 'result'],
    methods: {
        playerName: function () {
            return this.player.firstName + " " + this.player.lastName;
        },
        playResult: function () {
            if(this.result != null) {
                if(this.result.isDraw) {
                    return "draw";
                } else {
                    return this.result.winner.id == this.player.id ? "winner" : "loser";
                }
            }
            else 
                return "result pending"
        }
    },
    template: '<div>'
        + '<div v-if="player">'
            + '<h2 class="truncate tooltipped" :data-tooltip="playerName()">{{ player.firstName }}</h2>'
            + '<div class="chip">'
                + '{{ playResult() }}'
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
        methods: {
            isUserAdmin: function (event) {
                // TODO: Find a more secure role id system...
                var user = this.state.user;
                for(var i in user.userRoles) {
                    var userRole = user.userRoles[i].role.type;
                    if(userRole == "admin" || userRole == "superadmin" ) {
                        return true;
                    }
                }
                return false;
            }
        },
        data: {
            currentView: LoadingComponent,
            state: null
        }
    });

    $.get( "/api/membership/results")
    .done( function(data) {
        
        console.log("Match Results Get: ", data);
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
    })
    .fail(function (error) {
        // Errored...
        Materialize.toast("Error loading results");
    });   
});