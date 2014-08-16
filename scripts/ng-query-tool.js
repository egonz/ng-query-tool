(function(angular, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['angular'], function(angular) {
            return factory(angular);
        });
    } else {
        return factory(angular);
    }
}(angular || null, function(angular) {
    'use strict';
/**
 * ngTable: Table + Angular JS
 *
 * @author Eddie Gonzales <eddiemgonzales@gmail.com>
 * @url https://github.com/egonz/ng-query-tool
 * @license MIT License <http://opensource.org/licenses/MIT>
 */

 var app = angular.module('ng-query-tool', []);


/**
 * @ngdoc service
 * @name ng-query-tool.factory:NgQueryToolService
 * @description REST API Interface
 */
app.factory('NgQueryToolService', ['$http',
    function ($http) {
        return {
            meta: function() {
                var promise = $http.get('app/rest/ngquerytool/meta').then(function (response) {
                    return response.data;
                });
                return promise;
            },
            search: function(sql, args, page, rp) {
                var promise = $http.get('app/rest/ngquerytool/search?sql=' + escape(sql) + 
                    '&page=' + page + '&rp=' + rp + '&bindVars[]=' + escape(args)).then(function (response) {
                    return response.data;
                });
                return promise;
            }
        }
	}
]);

 /**
 * @ngdoc directive
 * @name ng-query-tool.directive:ng-query-tool
 * @restrict E
 *
 * @description
 * Directive that creates the Query Tool.
 */
app.directive('ngQueryTool', ['NgQueryToolService', 
                              'ngTableParams', '$filter', 
                              '$rootScope', '$compile', '$rootElement', 
                              'SavedQuery', '$timeout', function(NgQueryToolService, ngTableParams, 
                              $filter, $rootScope, $compile, $rootElement, SavedQuery, $timeout) {
    var startedResultWatch = false;
    var tableDDLs;

    function _setColumns(scope) {
        if (scope.rqb_data.rows.length > 0) {
            var row = scope.rqb_data.rows[0];
            scope.columns = [];

            for(var name in row) {
                scope.columns.push({ title: name, field: name, visible: true });
            }
        }
    }

    function _setUpNgTable(scope) {
        var getData = function() {
            if (typeof scope.rqb_data !== 'undefined') {
                _setColumns(scope);
                return scope.rqb_data.rows;
            } else {
                return [{}];
            }
        };

        scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 10           // count per page
        },  {
                total: function () { return getData().length; }, // length of data
                getData: function($defer, params) {
                    var filteredData = getData();
                    var orderedData = params.sorting() ?
                                        $filter('orderBy')(filteredData, params.orderBy()) :
                                        filteredData;

                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                },
                scope: { $data: {} }
            }
        );
    }

    function _startResultWatcher(scope) {
        if (!startedResultWatch) {
            scope.$watch("rqb_data", function () {
                scope.tableParams.reload();
            });
            startedResultWatch = true;
        }
    }

    function _startRedQueryBuilderFormInitListener(scope) {
        var redQueryBuilderFormInitListener = setInterval(function() {
            if (document. getElementsByClassName('rqbFrom').length > 0) {
                console.log('RedQueryBuilderFormInit Complete');
                var html = "<td vertical><button id='rqb-show-table-def' " +
                    "class='btn btn-info' data-container='body' " +
                    "data-toggle='popover' data-placement='right'>" +
                    "<i class='fa fa-eye'></i> Show Table Def</button></td>";
                var linkingFunction = $compile(html);
                var elem = linkingFunction(scope);
                $rootElement.find('.rqbFrom').parent().parent().append(elem);
                $rootElement.find('#rqb tr:nth-child(2) td:nth-child(1) button').prepend("<i class='fa fa-plus'></i> ");
                clearInterval(redQueryBuilderFormInitListener);
            }
        },333);
    }

    function _setTableDef(tableData, iElement) {
        console.log(tableData);
        var selectedTable = iElement.find(".rqbFrom :selected").val();
        //TODO cache these defs in an object
        for (var i = 0; i < tableData.tables.length; i++) {
            if (tableData.tables[i].name === selectedTable) {
                var colDef = "<table>";
                for (var j = 0; j < tableData.tables[i].columns.length; j++) {
                    colDef += "<tr>";
                    colDef += "<td>" + tableData.tables[i].columns[j].name + "</td><td>" +
                        tableData.tables[i].columns[j].type + "</td>";
                    colDef += "</tr>";
                }
                colDef += "</table>";

                $('#rqb-show-table-def').popover('destroy');
                $('#rqb-show-table-def').popover({html:true, content: colDef});

                return;
            }
        }
    }

    function _loadSavedQueries(scope) {
        SavedQuery.query(function(data) {
            if (data.length > 0)
                scope.savedQueries = data;
        }, function(error) {
            _createAlert(scope, 'danger', error.data.message);
        });
    }

    function _createAlert(scope, type, msg) {
        var index = scope.alerts.length;
        var alert = {type:type, msg:msg, expired: false};
        scope.alerts.push(alert);
        
        $timeout(function() { alert.isFaded = true; }, 9500);
        $timeout(function() {
            scope.closeAlert(index);
            scope.$apply();
        }, 10000);
    }

    return {
        replace: true,
        restrict: 'E',
        templateUrl: 'views/redquerybuilder.html',
        link: function(scope, iElement, attr) {
            scope.sql = '';
            scope.hideSql = true;
            scope.isSavedSqlOpen = false;
            scope.alerts = [];

            scope.saveSql = function() {
                if (typeof scope.queryName === 'undefined' || !scope.queryName || scope.queryName.length === 0) {
                    _createAlert(scope, 'danger', 'A query name is required.');
                    return;
                }

                SavedQuery.save({query:scope.sql, name: scope.queryName}, function () {
                    scope.savedQueries = SavedQuery.query();
                }, function(error) {
                    _createAlert(scope, 'danger', error.data.message);
                });
            };

            scope.selectSavedQuery = function(savedQuery) {
                scope.sql = savedQuery.query;
                scope.hideSql = false;
                scope.isSavedSqlOpen = false;
                scope.selectedQuery = savedQuery;
                scope.queryName = savedQuery.name;
            }

            scope.closeAlert = function(index) {
                scope.alerts.splice(index, 1);
            }

            _loadSavedQueries(scope);
            _setUpNgTable(scope);
            _startRedQueryBuilderFormInitListener(scope);

            var button = iElement.find('#rqb-submit');
            button.bind("click", function() {
                var args;

                if (typeof scope.args === 'undefined')
                    args = '';
                else
                    args = scope.args;

                RedQueryBuilderService.search(scope.sql, args, scope.tableParams.page() - 1,
                                              scope.tableParams.count()).then(function(data) {
                    _startResultWatcher(scope);
                    scope.rqb_data = data;
                });
            });

            RedQueryBuilderService.meta().then(function(data) {
                RedQueryBuilderFactory.create({
                    "meta" : data,
                    onSqlChange : function(sql, args) {
                        scope.selectedQuery = undefined;
                        scope.queryName = undefined;
                        scope.sql = sql;
                        scope.args = args;
                        scope.rqb_data = null;
                        _setTableDef(data, iElement);
                        scope.$apply();
                    },
                    enumerate : function(request, response) {
                        if (request.columnName == 'CATEGORY') {
                            response([{value:'A', label:'Small'}, {value:'B', label:'Medium'}]);
                        } else {
                            response([{value:'M', label:'Male'}, {value:'F', label:'Female'}]);
                        }
                    },
                    editors : [ {
                        name : 'DATE',
                        format : 'dd.MM.yyyy'
                    } ]
                }, '', []);
            });
        }
    };
}]);