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
        .controller("bingoCtrl", function ($scope, $rootScope, $interval) {
            var self = this;
            var bingoObj = $scope.bingoObj = this.bingoObj = {
                numbers : [],
                checkedGroupsCount : 0,
                activeState: false
            };
            
            var numbers = $scope.bingoObj.numbers = [];
            
            var validatePad = function (numbers) {
                var i, j, map = [];
                for (i = 0; i < 5; i++) {
                    for (j = 0; j < 5; j++) {
                        if (!map[numbers[i][j].value]) {
                            numbers[i][j].unique = true;
                        } else {
                            var r, c;
                            r = Math.floor(map[numbers[i][j].value] / 5);
                            c = Math.floor(map[numbers[i][j].value] % 5);
                            numbers[r][c].unique = false;
                            numbers[i][j].unique = false;
                        }
                        map[numbers[i][j].value] = i * 5 + j;
                    }
                }
            };
            
            this.initialize = function () {
                var usedNumbers = [];
                var i, j;
                for (i = 0; i < 5; i++) {
                    numbers[i] = [];
                    for (j = 0; j < 5; j++) {
                        var nVal = null;
                        while (!nVal) {
                            var newVal = Math.ceil(Math.random() * 25);
                            if (usedNumbers.indexOf(newVal) === -1) {
                                usedNumbers.push(newVal);
                                nVal = newVal;
                            }
                        }
                        numbers[i][j] = {
                            value: nVal,                // Value of cell.
                            unique: true,               // Weather value is unique (No duplicate).
                            checked: false,             // Weather cell is checked.
                            rowChecked: false,          // Weather row containing the cell is checked.
                            columnChecked: false,       // Weather column containing the cell is checked.
                            diagonal_1_checked: false,  // Weather diagonal-1 containing the cell is checked.
                            diagonal_2_checked: false,  // Weather diagonal-2 containing the cell is checked.
                            index: 5 * i + j            // Numeric index for the cell.
                        };
                    }
                }
                $scope.bingoObj.checkedGroupsCount = 0;
                $scope.$watch('bingoObj.numbers', validatePad, true);
            };
            
            var checkForGroups = function (index) {
                var i = Math.floor(index / 5);
                var j = Math.floor(index % 5);
                var bRowChecked, bColumnChecked, bDiagonal_1_Checked, bDiagonal_2_Checked, row, column;
                // Row Check
                bRowChecked = $scope.bingoObj.numbers[i].every(function (number) {
                    return number.checked;
                });
                if (bRowChecked) {
                    Array.apply(null, new Array(5)).forEach(function (d, j) {
                        $scope.bingoObj.numbers[i][j].rowChecked = true;
                    });
                    $scope.bingoObj.checkedGroupsCount++;
                }
                // Column Check
                bColumnChecked = $scope.bingoObj.numbers.every(function (rows) {
                    var number = rows[j];
                    return number.checked;
                });
                if (bColumnChecked) {
                    Array.apply(null, new Array(5)).forEach(function (d, i) {
                        $scope.bingoObj.numbers[i][j].columnChecked = true;
                    });
                    $scope.bingoObj.checkedGroupsCount++;
                }
                // Diagonal-1 Check
                if (i === j) {
                    bDiagonal_1_Checked = Array.apply(null, new Array(5)).every(function (d, i) {
                        return $scope.bingoObj.numbers[i][i].checked;
                    });
                }
                if (bDiagonal_1_Checked) {
                    Array.apply(null, new Array(5)).forEach(function (d, i) {
                        $scope.bingoObj.numbers[i][i].diagonal_1_checked = true;
                    });
                    $scope.bingoObj.checkedGroupsCount++;
                }
                // Diagonal-2 Check
                if (i + j === 4) {
                    bDiagonal_2_Checked = Array.apply(null, new Array(5)).every(function (d, i) {
                        return $scope.bingoObj.numbers[i][4 - i].checked;
                    });
                }
                if (bDiagonal_2_Checked) {
                    Array.apply(null, new Array(5)).forEach(function (d, i) {
                        $scope.bingoObj.numbers[i][4 - i].diagonal_2_checked = true;
                    });
                    $scope.bingoObj.checkedGroupsCount++;
                }
            };
            
            this.checkNumber = function (number) {
                if (number && !number.checked) {
                    number.checked = true;
                    checkForGroups(number.index);
                    if ($scope.bingoObj.activeState) {
                        $scope.bingoObj.activeState = false;
                        $rootScope.$emit('userPlayed', number.value);
                    }
                    if ($scope.bingoObj.checkedGroupsCount >= 5) {
                        $rootScope.$emit('bingo');
                    }
                }
            };
            
            this.checkCellWithValue = function (nVal) {
                if (angular.isArray(nVal)) {
                    var aVals = nVal;
                    var self = this;
                    aVals.forEach(function (nVal) {
                        self.checkCellWithValue(nVal);
                    });
                    return;
                }
                var n;
                $scope.bingoObj.numbers.forEach(function (rows) {
                    rows.forEach(function (num) {
                        if (num.value === nVal) {
                            n = num;
                        }
                    });
                });
                this.checkNumber(n);
            };
            
            this.initialize();
            
            $rootScope.$on('numberChecked', function (oEvt, args) {
                self.checkCellWithValue(args);
            });
            $rootScope.$on('turnArrived', function (oEvt, args) {
                $scope.bingoObj.activeState = true;
            });
        });
}());