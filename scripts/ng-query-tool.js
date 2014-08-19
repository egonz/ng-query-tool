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

     var app = angular.module('ngQueryTool', ['ngTable', 'ngTableExport', 'ui.bootstrap', 
        'xeditable', 'ui.bootstrap.transitions']);

     app
        .run(['editableOptions',
            function(editableOptions) {
                 editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
        }]);


    /**
     * @ngdoc service
     * @name ngQueryTool.factory:NgQueryToolService
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

    app.factory('SavedQuery', ['$resource',
        function ($resource) {
            return $resource('app/rest/savedqueries/:id', {}, {
                'query': { method: 'GET', isArray: true},
                'get': { method: 'GET'}
            });
    }]);

     /**
     * @ngdoc directive
     * @name ngQueryTool.directive:ng-query-tool
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
                _createAlert(scope, 'danger', 'Error loading Saved Queries: ' + error.data.error);
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
            templateUrl: 'bower_components/ng-query-tool/views/ng-query-tool.html',
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

                var button = iElement.find('#ng-query-table-submit');
                button.bind("click", function() {
                    var args;

                    if (typeof scope.args === 'undefined')
                        args = '';
                    else
                        args = scope.args;

                    NgQueryToolService.search(scope.sql, args, scope.tableParams.page() - 1,
                                                  scope.tableParams.count()).then(function(data) {
                        _startResultWatcher(scope);
                        scope.rqb_data = data;
                    });
                });

                NgQueryToolService.meta().then(function(data) {
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

    return app;
}));

angular.module('ui.bootstrap.transition', [])

/**
 * $transition service provides a consistent interface to trigger CSS 3 transitions and to be informed when they complete.
 * @param  {DOMElement} element  The DOMElement that will be animated.
 * @param  {string|object|function} trigger  The thing that will cause the transition to start:
 *   - As a string, it represents the css class to be added to the element.
 *   - As an object, it represents a hash of style attributes to be applied to the element.
 *   - As a function, it represents a function to be called that will cause the transition to occur.
 * @return {Promise}  A promise that is resolved when the transition finishes.
 */
.factory('$transition', ['$q', '$timeout', '$rootScope', function($q, $timeout, $rootScope) {

  var $transition = function(element, trigger) {

    var deferred = $q.defer();
    var transitionEndHandler = function(event) {
      $rootScope.$apply(function() {
      element.unbind($transition.transitionEndEventName, transitionEndHandler);
        deferred.resolve(element);
      });
    };

    // Only bind if the browser supports transitions
    if ( $transition.transitionEndEventName ) {
      element.bind($transition.transitionEndEventName, transitionEndHandler);
    }

    // Wrap in a timeout to allow the browser time to update the DOM before the transition is to occur
    $timeout(function() {
      if ( angular.isString(trigger) ) {
        element.addClass(trigger);
      } else if ( angular.isFunction(trigger) ) {
        trigger(element);
      } else if ( angular.isObject(trigger) ) {
        element.css(trigger);
      }

      // If the browser doesn't support transitions then we immediately resolve the event
      if ( !$transition.transitionEndEventName ) {
        deferred.resolve(element);
      }
    });

    // Add out custom cancel function to the promise that is returned
    // We can call this if we are about to run a new transition, which we know will prevent this transition from ending,
    // i.e. it will therefore never raise a transitionEnd event for that transition
    deferred.promise.cancel = function() {
      if ( $transition.transitionEndEventName ) {
        element.unbind($transition.transitionEndEventName, transitionEndHandler);
      }
      deferred.reject('Transition cancelled');
    };

    return deferred.promise;
  };

  // Work out the name of the transitionEnd event
  var transElement = document.createElement('trans');
  var transitionEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'msTransition': 'MSTransitionEnd',
    'transition': 'transitionend'
  };
  for (var name in transitionEndEventNames){
    if (transElement.style[name] !== undefined) {
      $transition.transitionEndEventName = transitionEndEventNames[name];
    }
  }
  return $transition;
}])


angular.module('ui.bootstrap.transitions',['ui.bootstrap.transition'])

// The collapsible directive indicates a block of html that will expand and collapse
.directive('transition', ['$transition', function($transition) {
  // CSS transitions don't work with height: auto, so we have to manually change the height to auto
  var fixUpHeight = function(scope, element, height) {
    // We remove the collapse CSS class to prevent a transition when we change to height: auto
    element.removeClass('collapse');
    element.css({ height: height });
    // It appears that  reading offsetWidth makes the browser realise that we have changed the
    // height already :-/
    var x = element[0].offsetWidth;
    element.addClass('collapse');
  };
  
  var addFade = function(scope, element) {
    element.addClass('fade');
  };
  
  var addSlide = function(scope, element, kind) {
    if(kind === 'slide'){
     element.addClass('in'); 
    }
  };

  return {
    link: function(scope, element, attrs) {

      var isTransitioned;
      //transition type requested
      var tType = attrs.transition;
      var firstLoad = 0;
      
      if(tType === 'fade'){
        addFade(scope, element);
      }
      
      scope.$watch(attrs.doIt, function(value) {
        if (value) {
          doIt(tType);
        } else {
          undoIt(tType);
        }
      });
      

      var currentTransition;
      var doTransition = function(change) {
        if ( currentTransition ) {
          currentTransition.cancel();
        }
        currentTransition = $transition(element,change);
        currentTransition.then(
          function() { currentTransition = undefined; },
          function() { currentTransition = undefined; }
        );
        return currentTransition;
      };

      var doIt = function(type) {
        if(type === 'collapse'){
          doTransition({ height : element[0].scrollHeight + 'px' })
          .then(function() {
            if ( !isTransitioned ) {
              fixUpHeight(scope, element, 'auto');
            }
            scope.$eval(attrs['onDone'] || angular.noop);
          });
          isTransitioned = false;
        }
        else if(type === 'fade'){
           firstLoad = 1;
           doTransition({opacity: '0'});
        }
        else if(type === 'minimize'){
           firstLoad = 1;
           element.removeClass('in');
           element.addClass('out'); 
           element.css({'margin-left': '-300px'});
        }
     };
      
      var undoIt = function(type) {
        if(type === 'collapse'){
          isTransitioned = true;
          fixUpHeight(scope, element, element[0].scrollHeight + 'px');
          doTransition({'height':'0'});
        }
        else if(type === 'fade'){
          doTransition({opacity: '1'});
          if(firstLoad === 1){
            scope.$eval(attrs['onDone'] || angular.noop);
          }
        }
        else if(type === 'minimize'){
          if(firstLoad === 1){
             element.removeClass('out');
             element.addClass('in'); 
             element.css({'margin-left': '0px'});
             scope.$eval(attrs['onDone'] || angular.noop);
          }
        }
        
      };
      
      
    }
  };
}]);


function RedQueryBuilder(){var U='',R=' top: -1000px;',pb='" for "gwt:onLoadErrorFn"',nb='" for "gwt:onPropertyErrorFn"',$='");',qb='#',Tb='.cache.js',sb='/',yb='//',Mb='bower_components/ng-query-tool/scripts/redQueryBuilder/27AE4A5130BC9DF419BA70131D253046',Nb='bower_components/ng-query-tool/scripts/redQueryBuilder/3CDFFCDADEAA64C02ECEC7F93B066824',Ob='bower_components/ng-query-tool/scripts/redQueryBuilder/5CB195A401E9A10A1408E41DDB39D385',Pb='bower_components/ng-query-tool/scripts/redQueryBuilder/6BAB7BE0E9D548D71DDB27B9D2B4EC7A',Sb=':',hb='::',T='<!doctype html>',V='<html><head><\/head><body><\/body><\/html>',kb='=',rb='?',Qb='A31396B77C801AEE5573B0AB152276DB',mb='Bad handler "',S='CSS1Compat',Y='Chrome',X='DOMContentLoaded',M='DUMMY',Rb='E2AFB49F210668E094ACEB3CDFD1E069',K='RedQueryBuilder',Lb='RedQueryBuilder.devmode.js',wb='RedQueryBuilder.nocache.js',gb='RedQueryBuilder::',xb='base',vb='baseUrl',H='begin',N='body',G='bootstrap',ub='clear.cache.gif',jb='content',Vb='end',Z='eval("',Hb='gecko',Ib='gecko1_8',I='gwt.codesvr.RedQueryBuilder=',J='gwt.codesvr=',ob='gwt:onLoadErrorFn',lb='gwt:onPropertyErrorFn',ib='gwt:property',db='head',Gb='ie6',Fb='ie8',Eb='ie9',O='iframe',tb='img',ab='javascript',P='javascript:""',Ub='loadExternalRefs',eb='meta',cb='moduleRequested',bb='moduleStartup',Db='msie',fb='name',Ab='opera',Q='position:absolute; width:0; height:0; border:none; left: -1000px;',Cb='safari',_='script',Kb='selectingPermutation',L='startup',W='undefined',Jb='unknown',zb='user.agent',Bb='webkit';var o=window;var p=document;r(G,H);function q(){var a=o.location.search;return a.indexOf(I)!=-1||a.indexOf(J)!=-1}
function r(a,b){if(o.__gwtStatsEvent){o.__gwtStatsEvent({moduleName:K,sessionId:o.__gwtStatsSessionId,subSystem:L,evtGroup:a,millis:(new Date).getTime(),type:b})}}
RedQueryBuilder.__sendStats=r;RedQueryBuilder.__moduleName=K;RedQueryBuilder.__errFn=null;RedQueryBuilder.__moduleBase=M;RedQueryBuilder.__softPermutationId=0;RedQueryBuilder.__computePropValue=null;RedQueryBuilder.__getPropMap=null;RedQueryBuilder.__gwtInstallCode=function(){};RedQueryBuilder.__gwtStartLoadingFragment=function(){return null};var s=function(){return false};var t=function(){return null};__propertyErrorFunction=null;var u=o.__gwt_activeModules=o.__gwt_activeModules||{};u[K]={moduleName:K};var v;function w(){y();return v}
function x(){y();return v.getElementsByTagName(N)[0]}
function y(){if(v){return}var a=p.createElement(O);a.src=P;a.id=K;a.style.cssText=Q+R;a.tabIndex=-1;p.body.appendChild(a);v=a.contentDocument;if(!v){v=a.contentWindow.document}v.open();var b=document.compatMode==S?T:U;v.write(b+V);v.close()}
function z(k){function l(a){function b(){if(typeof p.readyState==W){return typeof p.body!=W&&p.body!=null}return /loaded|complete/.test(p.readyState)}
var c=b();if(c){a();return}function d(){if(!c){c=true;a();if(p.removeEventListener){p.removeEventListener(X,d,false)}if(e){clearInterval(e)}}}
if(p.addEventListener){p.addEventListener(X,d,false)}var e=setInterval(function(){if(b()){d()}},50)}
function m(c){function d(a,b){a.removeChild(b)}
var e=x();var f=w();var g;if(navigator.userAgent.indexOf(Y)>-1&&window.JSON){var h=f.createDocumentFragment();h.appendChild(f.createTextNode(Z));for(var i=0;i<c.length;i++){var j=window.JSON.stringify(c[i]);h.appendChild(f.createTextNode(j.substring(1,j.length-1)))}h.appendChild(f.createTextNode($));g=f.createElement(_);g.language=ab;g.appendChild(h);e.appendChild(g);d(e,g)}else{for(var i=0;i<c.length;i++){g=f.createElement(_);g.language=ab;g.text=c[i];e.appendChild(g);d(e,g)}}}
RedQueryBuilder.onScriptDownloaded=function(a){l(function(){m(a)})};r(bb,cb);var n=p.createElement(_);n.src=k;p.getElementsByTagName(db)[0].appendChild(n)}
RedQueryBuilder.__startLoadingFragment=function(a){return C(a)};RedQueryBuilder.__installRunAsyncCode=function(a){var b=x();var c=w().createElement(_);c.language=ab;c.text=a;b.appendChild(c);b.removeChild(c)};function A(){var c={};var d;var e;var f=p.getElementsByTagName(eb);for(var g=0,h=f.length;g<h;++g){var i=f[g],j=i.getAttribute(fb),k;if(j){j=j.replace(gb,U);if(j.indexOf(hb)>=0){continue}if(j==ib){k=i.getAttribute(jb);if(k){var l,m=k.indexOf(kb);if(m>=0){j=k.substring(0,m);l=k.substring(m+1)}else{j=k;l=U}c[j]=l}}else if(j==lb){k=i.getAttribute(jb);if(k){try{d=eval(k)}catch(a){alert(mb+k+nb)}}}else if(j==ob){k=i.getAttribute(jb);if(k){try{e=eval(k)}catch(a){alert(mb+k+pb)}}}}}t=function(a){var b=c[a];return b==null?null:b};__propertyErrorFunction=d;RedQueryBuilder.__errFn=e}
function B(){function e(a){var b=a.lastIndexOf(qb);if(b==-1){b=a.length}var c=a.indexOf(rb);if(c==-1){c=a.length}var d=a.lastIndexOf(sb,Math.min(c,b));return d>=0?a.substring(0,d+1):U}
function f(a){if(a.match(/^\w+:\/\//)){}else{var b=p.createElement(tb);b.src=a+ub;a=e(b.src)}return a}
function g(){var a=t(vb);if(a!=null){return a}return U}
function h(){var a=p.getElementsByTagName(_);for(var b=0;b<a.length;++b){if(a[b].src.indexOf(wb)!=-1){return e(a[b].src)}}return U}
function i(){var a=p.getElementsByTagName(xb);if(a.length>0){return a[a.length-1].href}return U}
function j(){var a=p.location;return a.href==a.protocol+yb+a.host+a.pathname+a.search+a.hash}
var k=g();if(k==U){k=h()}if(k==U){k=i()}if(k==U&&j()){k=e(p.location.href)}k=f(k);return k}
function C(a){if(a.match(/^\//)){return a}if(a.match(/^[a-zA-Z]+:\/\//)){return a}return RedQueryBuilder.__moduleBase+a}
function D(){var f=[];var g;function h(a,b){var c=f;for(var d=0,e=a.length-1;d<e;++d){c=c[a[d]]||(c[a[d]]=[])}c[a[e]]=b}
var i=[];var j=[];function k(a){var b=j[a](),c=i[a];if(b in c){return b}var d=[];for(var e in c){d[c[e]]=e}if(__propertyErrorFunc){__propertyErrorFunc(a,d,b)}throw null}
j[zb]=function(){var b=navigator.userAgent.toLowerCase();var c=function(a){return parseInt(a[1])*1000+parseInt(a[2])};if(function(){return b.indexOf(Ab)!=-1}())return Ab;if(function(){return b.indexOf(Bb)!=-1}())return Cb;if(function(){return b.indexOf(Db)!=-1&&p.documentMode>=9}())return Eb;if(function(){return b.indexOf(Db)!=-1&&p.documentMode>=8}())return Fb;if(function(){var a=/msie ([0-9]+)\.([0-9]+)/.exec(b);if(a&&a.length==3)return c(a)>=6000}())return Gb;if(function(){return b.indexOf(Hb)!=-1}())return Ib;return Jb};i[zb]={gecko1_8:0,ie6:1,ie8:2,ie9:3,opera:4,safari:5};s=function(a,b){return b in i[a]};RedQueryBuilder.__getPropMap=function(){var a={};for(var b in i){if(i.hasOwnProperty(b)){a[b]=k(b)}}return a};RedQueryBuilder.__computePropValue=k;o.__gwt_activeModules[K].bindings=RedQueryBuilder.__getPropMap;r(G,Kb);if(q()){return C(Lb)}var l;try{h([Fb],Mb);h([Gb],Nb);h([Ab],Ob);h([Cb],Pb);h([Ib],Qb);h([Eb],Rb);l=f[k(zb)];var m=l.indexOf(Sb);if(m!=-1){g=parseInt(l.substring(m+1),10);l=l.substring(0,m)}}catch(a){}RedQueryBuilder.__softPermutationId=g;return C(l+Tb)}
function E(){if(!o.__gwt_stylesLoaded){o.__gwt_stylesLoaded={}}r(Ub,H);r(Ub,Vb)}
A();RedQueryBuilder.__moduleBase=B();u[K].moduleBase=RedQueryBuilder.__moduleBase;var F=D();E();r(G,Vb);z(F);return true}
RedQueryBuilder.succeeded=RedQueryBuilder();


/**
 * A helper class to construct and manage RedQueryBuilder instances.
 * 
 * Use RedQueryBuilderFactory.create rather than the constructor.
 * 
 * @constructor
 */
function RedQueryBuilderFactory(config, sql, args) {
    /**
     * The description of the database.
     * @type Configuration
     */
    this.config = config;
    
    /**
     * Initial SQL.
     * @type string
     */
    this.sql = sql;
    
    /**
     * Initial arguments.
     * @type string[]
     */
    this.args = args;
}

RedQueryBuilderFactory.create = function(config, sql, args) {
  var x = new RedQueryBuilderFactory(config, sql, args);
  x.waitForLoad();
}

RedQueryBuilderFactory.prototype.waitForLoad = function() {
  var rqb = this;
  var fn = function() {
    if (!window.redQueryBuilder) {
      setTimeout(fn, 50);
    } else {
      rqb.ready();
    }
  }
  fn();
}

RedQueryBuilderFactory.prototype.ready = function() {
  window.redQueryBuilder(this.config, this.sql, this.args);
  if (this.config.onLoad) {
      this.config.onLoad();
  }
}