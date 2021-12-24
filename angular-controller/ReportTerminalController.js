app.controller("ReportTerminalCtrl", function ($scope,$http,$filter,$rootScope,dateFilter,$timeout,$interval,$window,authFact) {
    $scope.msg = "This is Terminal report controller";
    $scope.tab = 1;
    $scope.token = $scope.loginDetails.person.uuid;
    console.log($scope.loginDetails);
    if($scope.token==undefined){
        $window.location.href = base_url;
    }
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


    $scope.selectDate=true;
    $scope.winning_date=$filter('date')(new Date(), 'dd.MM.yyyy');
    $scope.start_date=new Date();
    $scope.end_date=new Date();
    $scope.barcode_report_date=new Date();
    $scope.changeDateFormat=function(userDate){
        return moment(userDate).format('YYYY-MM-DD');
    };

    $scope.isLoading=false;
    $scope.isLoading2=false;

    // get total sale report for 2d game
    $scope.alertMsg=true;
    $scope.alertMsg2=true;
    $scope.alertMsgCard=true;
    
    $scope.getNetPayableDetailsByDate=function (start_date,end_date) {
        
        $scope.isLoading=true;
        $scope.alertMsg=false;
        $scope.alertMsg2=true;
        $scope.alertMsgCard=false;
        var start_date=$scope.changeDateFormat(start_date);
        var end_date=$scope.changeDateFormat(end_date);
        if(start_date > end_date){
            var temp=start_date;
            start_date=end_date;
            end_date=temp;
        }

        var request = $http({
            method: "post",
            url: api_url+"/v1/terminalReportDetails",
            dataType:JSON,
            data: {
                start_date: start_date
                ,end_date: end_date
                ,terminal_id: $scope.users.userId
            }
            ,headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function(response){
            $scope.saleReport=response.data;
            $scope.isLoading=false;
            if($scope.saleReport.length==0){
                $scope.alertMsg=true;
            }else{
                $scope.alertMsg=false;
            }
        });
    };

    //$scope.getNetPayableDetailsByDate($scope.start_date,$scope.end_date);



    $scope.$watch("saleReport", function(newValue, oldValue){

        if(newValue != oldValue){
            var result=alasql('SELECT sum(amount) as total_amount,sum(commision) as total_commision,sum(prize_value) as total_prize_value,sum(net_payable) as total_net_payable  from ? ',[newValue]);
            $scope.saleReportFooter=result[0];
        }
    });


    $scope.gameList = [
        {id : 1, name : "2D"},
        {id : 2, name : "Card"}
    ];
    $scope.select_game=$scope.gameList[0];

    // get two digit draw time list
    $scope.getDrawList=function (gameNo) {
        if(gameNo==1){
            var request = $http({
                method: "get",
                url: api_url+"/v1/getAllDrawTimes",
                dataType:JSON,
                data: {}
                ,headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(function(response){
                $scope.drawTime=response.data;
            });
        }
        if(gameNo==2){
            var request = $http({
                method: "post",
                url: api_url+"/v1/get_card_draw_time",
                data: {}
                ,headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(function(response){
                $scope.drawTime=response.data.records;
            });
        }
    };
    $scope.getDrawList($scope.select_game.id);
    $scope.select_draw_time=0;


    $scope.barcodeType = [
        {id : 1, type : "All barcode"},
        {id : 2, type : "Winning barcode"}
    ];
    $scope.select_barcode_type=$scope.barcodeType[0].id;




    // get terminal report order by barcode
    $scope.showbarcodeReport=[];
    $scope.getAllBarcodeDetailsByDate=function (start_date,barcode_type,select_draw_time) {
        
        $scope.isLoading2=true;
        var start_date=$scope.changeDateFormat(start_date);
        $scope.x=select_draw_time;
        
        
        var request = $http({
            method: "post",
            url: api_url+"/v1/barcodeReportFromTerminal",
            dataType:JSON,
            data: {
                terminalId: $scope.users.userId
                ,startDate: start_date
            }
            ,headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function(response){
            $scope.barcodeWiseReport=response.data;
            $scope.isLoading2=false;
            var winBarcodeDetails=alasql('SELECT *  from ?  where prize_value > 0',[$scope.barcodeWiseReport]);
            
            if(barcode_type==1){
                $scope.showbarcodeReport=angular.copy($scope.barcodeWiseReport);
            }else{
                $scope.showbarcodeReport=angular.copy(winBarcodeDetails);
            }

            if(select_draw_time>0){
                $scope.x=parseInt($scope.x);
                $scope.showbarcodeReport=alasql("SELECT *  from ? where draw_master_id=?",[$scope.showbarcodeReport,$scope.x]);
            }

            // checking for data
            if($scope.showbarcodeReport.length==0){
                $scope.alertMsg2=true;
            }else{
                $scope.alertMsg2=false;
            }

        });

    };



   
    $scope.showParticulars=function (target,barcode) {
        $scope.particularsNote = '';
        $scope.target=target;
        var request = $http({
            method: "post",
            url: api_url+"/v1/getBarcodeInputDetails",
            data: {
                barcode: barcode
            }
            ,headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function(response){
            $scope.particularsDetails=response.data;
            $scope.particularsDetails.forEach(function (val, idx) {
                $scope.particularsNote += val.series_name + ' ' + val.particulars;
            });  
            $scope.showbarcodeReport[target].particulars = $scope.particularsNote;            
        });
    };



});

