'use strict';
  
(function () {
  
   let unregisterFilterEventListener = null;
   let unregisterMarkSelectionEventListener = null;
   let worksheet = null;
   let worksheetName = null;
   let categoryColumnNumber = null;
   let valueColumnNumber = null;
  
   $(document).ready(function () {
      tableau.extensions.initializeAsync({ 'configure':configure }).then(function () {
         // Draw the chart when initialising the dashboard.
         getSettings();
         drawChartJS();
         // Set up the Settings Event Listener.
         unregisterSettingsEventListener = tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
            // On settings change.
            getSettings();
            drawChartJS();
         });
      }, function (err) { console.log('Error while Initializing: ' +err.toString()); });
   });
  
   function getSettings() {
      // Once the settings change populate global variables from the settings.
      worksheetName = tableau.extensions.settings.get("worksheet");
      categoryColumnNumber = tableau.extensions.settings.get("categoryColumnNumber");
      valueColumnNumber = tableau.extensions.settings.get("valueColumnNumber");
  
      // If settings are changed we will unregister and re register the listener.
      if (unregisterFilterEventListener != null) {
         unregisterFilterEventListener();
      }
  
      // Get worksheet
      worksheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(function (sheet) {
         return sheet.name===worksheetName;
      });
  
      // Add listener
      unregisterFilterEventListener = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, (filterEvent) => {
         drawChartJS();
      });
 
      unregisterMarkSelectionEventListener = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, (filterEvent) => {
        drawChartJS();
     });
   }
  
   function drawChartJS() {
      worksheet.getSummaryDataAsync().then(function (sumdata) {
         var labels = [];
         var data = [];
         var worksheetData = sumdata.data;
    
         for (var i=0; i<worksheetData.length; i++) {
            labels.push(worksheetData[i][categoryColumnNumber-1].formattedValue);
            data.push(worksheetData[i][valueColumnNumber-1].value);
         }
         
      //Gauge min js 

      var opts = {
        angle: 0.15, // The span of the gauge arc
        lineWidth: 0.44, // The line thickness
        radiusScale: 1, // Relative radius
        pointer: {
          length: 0.6, // // Relative to gauge radius
          strokeWidth: 0.035, // The thickness
          color: '#000000' // Fill color
        },
        limitMax: false,     // If false, max value increases automatically if value > maxValue
        limitMin: false,     // If true, the min value of the gauge will be fixed
        colorStart: '#6FADCF',   // Colors
        colorStop: '#8FC0DA',    // just experiment with them
        strokeColor: '#E0E0E0',  // to see which ones work best for you
        generateGradient: true,
        highDpiSupport: true,     // High resolution support
        
      };
      var target = document.getElementById('myChart'); // your canvas element
      var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
      gauge.maxValue = 3000; // set max gauge value
      gauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
      gauge.animationSpeed = 32; // set animation speed (32 is default value)
      gauge.set(1250); // set actual value


      });
   }
 
   function configure() {
      const popupUrl=`${window.location.origin}/dialog.html`;
      let defaultPayload="";
     
      tableau.extensions.ui.displayDialogAsync(popupUrl, defaultPayload, { height:400, width:500 }).then((closePayload) => {
         drawChartJS();
      }).catch((error) => {
         switch (error.errorCode) {
            case tableau.ErrorCodes.DialogClosedByUser:
               console.log("Dialog was closed by user");
               break;
            default:
               console.error(error.message);
         }
      });
   }
})();