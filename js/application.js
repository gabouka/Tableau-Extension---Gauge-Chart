'use strict';
  
(function () {
  
   let unregisterFilterEventListener = null;
   let unregisterMarkSelectionEventListener = null;
   let worksheet = null;
   let worksheetName = null;
   let categoryColumnNumber = null;
   let valueColumnNumber = null;

   let titleNameValue="Click Configure";
   let selectColor1Value = null;
   let selectColor2Value = null;
   let selectColor3Value = null;
  
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

      titleNameValue = tableau.extensions.settings.get("titleNameValue");
      selectColor1Value =  tableau.extensions.settings.get("selectColor1Value");
      selectColor2Value =  tableau.extensions.settings.get("selectColor2Value");
      selectColor3Value =  tableau.extensions.settings.get("selectColor3Value");
  
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
       
      //  
      var totalValue=data[0];
      var budgetValue=data[1];
      var needleValue=data[2];


      //Gauge min js 

      var opts = {
        angle: 0, // The span of the gauge arc
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
        //percentColors: [[0.0, "#a9d70b" ], [0.50, "#f9c802"], [1.0, "#ff0000"]], //fill color gradient
        // staticLabels: {
        //   font: "10px sans-serif",  // Specifies font
        //   labels: [0, budgetValue, totalValue],  // Print labels at these values
        //   color: "#000000",  // Optional: Label text color
        //   fractionDigits: 0  // Optional: Numerical precision. 0=round off.
        // },
        staticZones: [
          {strokeStyle: selectColor1Value, min: 0, max: budgetValue}, // Red from 100 to 130
          {strokeStyle: selectColor2Value, min: budgetValue, max: needleValue}, // Yellow
          {strokeStyle: selectColor3Value, min: needleValue, max: totalValue} // Green
       ],
      //  renderTicks: {
      //   divisions: 5,
      //   divWidth: 1.1,
      //   divLength: 0.7,
      //   divColor: "#333333",
      //   subDivisions: 3,
      //   subLength: 0.5,
      //   subWidth: 0.6,
      //   subColor: "#666666"
      // },
        generateGradient: true,
        highDpiSupport: true,     // High resolution support
        
      };
      var target = document.getElementById('myChart'); // your canvas element
      var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
      gauge.maxValue = totalValue; // set max gauge value
      gauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
      gauge.animationSpeed = 32; // set animation speed (32 is default value)
      gauge.set(needleValue); // set actual value

      //Show Current Value
      $("#needleLine").html("<span>"+ needleValue + "</span>");
      });

      //Set Title
      $("#title").text(titleNameValue);
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