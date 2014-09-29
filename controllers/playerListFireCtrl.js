/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, document, navigator,angular, jQuery, Firebase, InstallTrigger */

/**************
 *   @author : Rithwik Anand
 *   @desc : Bingo - An Angular Based Bingo Game.
 *   @license : MIT Licensed
 ***************/

(function () {
    'use strict';
    angular.module('bingo')
        .controller("playerListFireCtrl", function ($scope, $rootScope, $interval, $timeout, $firebase, playerListService) {
            
            
            $scope.username = $scope.username + " - " +  Date.now() % 100000;
            $scope.userId = this.userId;
            
            var self = this;
            var url = "https://blinding-heat-269.firebaseio.com/playerList";
            var fireRef = new Firebase(url);
            $scope.playerList = this.playerList = $firebase(fireRef).$asArray();
            
            var getUser = function () {
                return $scope.playerList.$getRecord(self.userId);
            };
            
            var giveTurnToNextPlayer = function (currentPlayerIndex, noOfPasses) {
                if (noOfPasses === $scope.playerList.length - 1) {
                    return;
                }
                var nextPlayerIndex = (currentPlayerIndex + 1) % $scope.playerList.length;
                var nextPlayer = $scope.playerList[nextPlayerIndex];
                if (nextPlayer.position) {
                    giveTurnToNextPlayer(currentPlayerIndex + 1, noOfPasses + 1);
                }
                nextPlayer.turn = true;
                self.playerList.$save(nextPlayerIndex);
            };
            
            var onPlayerListChange = function (oArg) {
                var newPlayerList = $scope.playerList;
                var aAllNumbersChecked = [];
                var bTurnArrived = false;
                newPlayerList.forEach(function (player) {
                    aAllNumbersChecked.push(player.numbersChecked || []);
                });
                // NumberChecked Event
                aAllNumbersChecked = [].concat.apply([], aAllNumbersChecked);
                aAllNumbersChecked = aAllNumbersChecked.filter(function (number) {
                    return number && typeof number === 'number';
                });
                $rootScope.$emit("numberChecked", aAllNumbersChecked);
                
                //TurnArrived Event
                var user = getUser();
                if (user && user.turn) {
                    if (user.position) {
                        user.turn = false;
                        giveTurnToNextPlayer($scope.playerList.indexOf(user), 0);
                    } else {
                        $rootScope.$emit("turnArrived");
                    }
                }
                
            };
            
            $scope.playerList.$loaded().then(function (aPlayerList) {
                $scope.playerList.$add({
                    name: $scope.username,
                    numbersChecked: [],
                    turn: !aPlayerList.length,
                    position: 0
                }).then(function (player) {
                    self.nUserIndex = aPlayerList.length - 1;
                    self.userId = aPlayerList[aPlayerList.length - 1].$id;
                    onPlayerListChange();
                    $scope.playerList.$watch(onPlayerListChange);
                });
                
                window.onbeforeunload = function () {
                    $rootScope.$emit('playerLeft');
                };
                
                $rootScope.$on('userPlayed', function (oEvt, numberChecked) {
                    var user = getUser();
                    if (!user.numbersChecked) {
                        user.numbersChecked = [];
                    }
                    user.numbersChecked.push(numberChecked);
                    user.turn = false;
                    $scope.playerList.$save(user);
                    var userIndex = $scope.playerList.indexOf(user);
                    giveTurnToNextPlayer(userIndex, 0);
                });
                
                $rootScope.$on('bingo', function () {
                    var user = getUser();
                    var nCurrentMaxPosition = 0;
                    $scope.playerList.forEach(function (player, index) {
                        nCurrentMaxPosition = Math.max(nCurrentMaxPosition, player.position);
                    });
                    if (user.turn) {
                        user.turn = false;
                        $scope.playerList.$save(user);
                        giveTurnToNextPlayer($scope.playerList.indexOf(user), 0);
                    }
                    if (!user.position) {
                        user.position = nCurrentMaxPosition + 1;
                        $scope.playerList.$save(user);
                    }
                });
                
                $rootScope.$on('playerLeft', function () {
                    var user = getUser();
                    if (user && user.turn) {
                        user.turn = false;
                        giveTurnToNextPlayer($scope.playerList.indexOf(user), 0);
                    }
                    $scope.playerList.$remove(user);
                });
            });
            
            this.nameChange = function () {
                var user = getUser();
                $scope.playerList.$save(user);
            };
        });
}());