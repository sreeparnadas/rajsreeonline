app.controller("ManualResultCtrl", function ($scope,$http,$filter,$rootScope,dateFilter,$timeout,$interval,$window) {
    $scope.msg = "This is ManualResultCtrl controller";
    $scope.tab = 1;

    $scope.setTab = function(newTab){
        $scope.tab = newTab;
    };
    $scope.isSet = function(tabNum){
        return $scope.tab === tabNum;
    };

    $scope.selectedTab = {
        "color" : "white",
        "background-color" : "coral",
        "font-size" : "15px",
        "padding" : "5px"
    };


    $scope.x = false;   /*  This variable set for editable manual form  */

   $scope.gameList=[{game_id: 1,game_name: "2 DIGIT"}];


    $scope.getPlaySeries=function () {
        var request = $http({
            method: "get",
            url: api_url+"/v1/getPlaySeries",
            dataType:JSON,
            data: {}
            ,headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function(response){
            $scope.seriesList=response.data;            
        });
    };
    $scope.getPlaySeries();


    $scope.getDrawList=function () {
        var request = $http({
            method: "get",
            dataType:JSON,
            url: api_url+"/v1/getAllDrawTimes",
            data: {}
            ,headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function(response){
            $scope.timeList=response.data;
        });
    };
    $scope.getDrawList();

    $scope.getDigitDrawTime=function () {
        var request = $http({
            method: "get",
            url: api_url+"/v1/getDrawTimeForManualResult",
            dataType:JSON,
            data: {}
            ,headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function(response){
            $scope.digitDrawTime=response.data;
            $scope.manualData.time=$scope.digitDrawTime[0];
        });
    };
    $scope.getDigitDrawTime();


    $scope.series_one_val='';$scope.series_two_val='';$scope.series_three_val=''
    $scope.getEditableManual=function () {
        var request = $http({
            method: "get",
            url: api_url+"/v1/getLastInsertedManualResult",
            dataType:JSON,
            data: {}
            ,headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function(response){
            $scope.editableResult=response.data;  

            $scope.editableResult.forEach(function (val, idx) {
                if (val.play_series_id == 1) {
                    $scope.series_one_val=val.result;
                }
                if (val.play_series_id == 2) {
                    $scope.series_two_val=val.result;
                }
                if (val.play_series_id == 3) {
                    $scope.series_three_val=val.result;
                }
            });      
        });
    };


    $scope.manualData={
        series_one:'',series_two:'',series_three:''
    };




    $scope.submitManualResult=function(manualResult){
        var master={};
        
        master.draw_master_id=parseInt(manualResult.time.id);
        if(typeof manualResult.series_one === 'undefined'){
            master.series_one = -1;
        }else if(manualResult.series_one.length>0){
            master.series_one = parseInt(manualResult.series_one);
        }else{
            master.series_one = -1;
        }


        if(typeof manualResult.series_two === 'undefined'){
            master.series_two = -1;
        }else if(manualResult.series_two.length>0){
            master.series_two = parseInt(manualResult.series_two);
        }else{
            master.series_two = -1;
        }

        if(typeof manualResult.series_three === 'undefined'){
            master.series_three = -1;
        }else if(manualResult.series_three.length>0){
            master.series_three = parseInt(manualResult.series_three);
        }else{
            master.series_three = -1;
        }
     
        if( master.series_one== -1 && master.series_two== -1 && master.series_three == -1){
            alert('input not valid');
            return;
        }
       
        var request = $http({
            method: "post",
            url: api_url+"/v1/saveManualResult",
            dataType:JSON,
            data: {
                master: master
            }
            ,headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function(response){
            $scope.manualResultReport=response.data;
            // if($scope.manualResultReport.dberror.code==1062){
            //     alert("Duplicate entry!!!!");
            //     $window.location.reload();
            //     return;
            // }

            if($scope.manualResultReport.success==1){
                $scope.manualData={}; 
                alert("Result added manually");
                $scope.getDigitDrawTime();
                
            }else{
                alert("Something went wrong");
            }
        });
       
    };



    
    $scope.updateManualResult=function(drawId,series_one_val,series_two_val,series_three_val){
        var master={};
        console.log(drawId,series_one_val,series_two_val,series_three_val);
        master.draw_master_id=parseInt(drawId);
        if(isNaN(master.draw_master_id)){
            alert("Invalid draw time");return;
        }
        if(typeof series_one_val === 'undefined'){
            master.series_one = -1;
        }else if(series_one_val>=0){
            master.series_one = parseInt(series_one_val);
        }else{
            master.series_one = -1;
        }


        if(typeof series_two_val === 'undefined'){
            master.series_two = -1;
        }else if(series_two_val>=0){
            master.series_two = parseInt(series_two_val);
        }else{
            master.series_two = -1;
        }

        if(typeof series_three_val === 'undefined'){
            master.series_three = -1;
        }else if(series_three_val>=0){
            master.series_three = parseInt(series_three_val);
        }else{
            master.series_three = -1;
        }
     
        if( master.series_one== -1 && master.series_two== -1 && master.series_three == -1){
            alert('input not valid');return;
        }
       
        var request = $http({
            method: "post",
            url: api_url+"/v1/updateCurrentManual",
            dataType:JSON,
            data: {
                master: master
            }
            ,headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function(response){
            $scope.manualUpdateReport=response.data;
           
            if($scope.manualUpdateReport.success==1){
                alert("Updated");                
            }
        });
       
    };


    $scope.getInputTotalDrawAndGameWise=function(drawId){
        var request = $http({
            method: "post",
            url: api_url+"/v1/getTotalBoxInput",
            dataType:JSON,
            data: {
                  draw_id: drawId
              }
            ,headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          }).then(function(response){
              $scope.inputTotalRecord=response.data;
            
          });
  };
    

});

