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
