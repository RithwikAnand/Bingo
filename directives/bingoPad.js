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
        .directive('bingoPad', function () {
            return {
                restrict : 'E',
                scope : {
                    bingoObj : '=bingoObj',
                    bingoCtrl : '=bingoCtrl'
                },
                templateUrl : "templates/bingo-pad.html"
            };
        });
}());