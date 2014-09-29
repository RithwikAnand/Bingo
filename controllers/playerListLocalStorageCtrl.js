/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, document, navigator,angular, jQuery, html2canvas, InstallTrigger */

/**************
 *   @author : Rithwik Anand
 *   @desc : Bingo - An Angular Based Bingo Game.
 *   @license : MIT Licensed
 ***************/

(function () {
    'use strict';
    angular.module('bingo')
        .controller("playerListLocalStorageCtrl", function ($scope, $rootScope, $interval, $timeout, playerListService) {
            
            $scope.playerList = this.playerList = playerListService.getPlayerList();
            var self = this;
            $interval(function () {
                $scope.playerList = self.playerList = playerListService.getPlayerList();
            }, 500);
            
            $scope.username = $scope.username + " - " +  Date.now() % 100000;
            
            $scope.playerList.push({
                name: $scope.username,
                numbersChecked: [],
                turn: !$scope.playerList.length,
                position: 0
            });
            playerListService.setPlayerList($scope.playerList);
            var nUserIndex = this.nUserIndex = $scope.playerList.length - 1;
            
            var giveTurnToNextPlayer = function (currentPlayerIndex, noOfPasses) {
                if (noOfPasses === $scope.playerList.length - 1) {
                    return;
                }
                var nextPlayer = $scope.playerList[(currentPlayerIndex + 1) % $scope.playerList.length];
                if (nextPlayer.position) {
                    giveTurnToNextPlayer(currentPlayerIndex + 1, noOfPasses + 1);
                }
                nextPlayer.turn = true;
            };
            
            var onPlayerListChange = function (newPlayerList) {
                var aAllNumbersChecked = [];
                var bTurnArrived = false;
                newPlayerList.forEach(function (player) {
                    aAllNumbersChecked.push(player.numbersChecked);
                    if (player.name === $scope.username && player.turn && !player.position) {
                        bTurnArrived = true;
                    }
                });
                // NumberChecked Event
                aAllNumbersChecked = [].concat.apply([], aAllNumbersChecked);
                aAllNumbersChecked = aAllNumbersChecked.filter(function (number) {
                    return typeof number === 'number';
                });
                $rootScope.$emit("numberChecked", aAllNumbersChecked);
                
                //TurnArrived Event
                if (bTurnArrived) {
                    $rootScope.$emit("turnArrived");
                }
                
            };
            
            $scope.$watch('playerList', onPlayerListChange);
            
            window.onbeforeunload = function () {
                $rootScope.$emit('playerLeft');
            };
            
            $rootScope.$on('userPlayed', function (oEvt, numberChecked) {
                var user, userIndex;
                $scope.playerList.forEach(function (player, index) {
                    if (player.name === $scope.username) {
                        user = player;
                        userIndex = index;
                    }
                });
                user.numbersChecked.push(numberChecked);
                user.turn = false;
                giveTurnToNextPlayer(userIndex, 0);
                playerListService.setPlayerList($scope.playerList);
            });
            
            $rootScope.$on('bingo', function () {
                var user, userIndex;
                var nCurrentMaxPosition = 0;
                $scope.playerList.forEach(function (player, index) {
                    nCurrentMaxPosition = Math.max(nCurrentMaxPosition, player.position);
                    if (player.name === $scope.username) {
                        user = player;
                        userIndex = index;
                    }
                });
                if (user.turn) {
                    user.turn = false;
                    giveTurnToNextPlayer(userIndex, 0);
                }
                if (!user.position) {
                    user.position = nCurrentMaxPosition + 1;
                    playerListService.setPlayerList($scope.playerList);
                }
            });
            
            $rootScope.$on('playerLeft', function () {
                var user, userIndex;
                $scope.playerList.forEach(function (player, index) {
                    if (player.name === $scope.username) {
                        user = player;
                        userIndex = index;
                    }
                });
                if (user && user.turn) {
                    user.turn = false;
                    giveTurnToNextPlayer(userIndex, 0);
                }
                $scope.playerList.splice(nUserIndex, 1);
                playerListService.setPlayerList($scope.playerList);
            });
        });
}());