/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, document, navigator,angular, jQuery, localStorage, InstallTrigger */

/**************
 *   @author : Rithwik Anand
 *   @desc : Bingo - An Angular Based Bingo Game.
 *   @license : MIT Licensed
 ***************/
(function () {
    'use strict';
    angular.module('bingo')
        .factory('playerListService', function () {
            var STORAGE_ID = 'playerList-storage';
            return {
                getPlayerList : function () {
                    return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
                },
                
                setPlayerList : function (nVals) {
                    return localStorage.setItem(STORAGE_ID, JSON.stringify(nVals));
                }
            };
        });
}());