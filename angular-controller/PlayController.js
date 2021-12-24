app.controller('PlayController', function($cookies,$scope,$rootScope,$q,md5,$mdDialog,$timeout,toaster,$http,$interval,$q,RegistrationService,ParticipantService,$window,proofService,localStorageService) {
    $scope.msg = "This is play controller";
    $scope.disableSubmitButton=false;


     $scope.barcodeOilBill = {
        format: 'CODE128',
        lineColor: '#000000',
        width: 1,
        height: 25,
        displayValue: true,
        fontOptions: '',
        font: 'monospace',
        textAlign: 'center',
        textPosition: 'bottom',
        textMargin: 2,
        fontSize: 11,
        background: '#ffffff',
        margin: 0,
        marginTop: undefined,
        marginBottom: undefined,
        marginLeft: undefined,
        marginRight: undefined,
        valid: function (valid) {
        }
    }
    
    $scope.getAllSeriesName = function(){
        $http({
            method: 'GET',
            url: api_url+"/v1/getPlaySeries",
            dataType:JSON,
            data: {},
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function (response){
            $scope.allSeriesList = response.data;
        });
    };
    $scope.getAllSeriesName();

    $scope.getLastDrawresult = function(){
        $http({
            method: 'GET',
            url: api_url+"/v1/getPreviousResult",
            dataType:JSON,
            data: {},
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function (response){
            $scope.winningValue = response.data;
        });
    };
    $scope.getLastDrawresult();

    $scope.getResultListByDate = function(result_date){
        var dt=$scope.changeDateFormat(result_date);
        $http({
            method: 'POST',
            url: api_url+"/v1/getResultsByDate",
            dataType:JSON,
            data: {gameDate: dt},
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function (response){
            $scope.resultBydate = response.data;
        });
    };

    $scope.getScrollingMessage = function(){
        $http({
            method: 'GET',
            url: api_url+"/v1/getMessage",
            dataType:JSON,
            data: {},
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function (response){
            $scope.scrollingMsg = response.data;
        });
    };
    $scope.getScrollingMessage();

    $scope.liveAnimationFlag =false;
    $scope.counter = '';
    $scope.getNewDraw = function(){
        $http({
            method: 'GET',
            url: api_url+"/v1/getNextDrawNumber",
            dataType:JSON,
            data: {},
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function (response){
            $scope.counter = response.data.next_draw_id;
        });
    };
    $scope.getNewDraw();
    $interval(function () {
        $scope.getNewDraw();  

    },5000);
    $scope.$watch("counter", function() {
        if($scope.counter != undefined){
            $scope.getCurrentDrawTime();
            $scope.getLastDrawresult();
            $scope.liveAnimationFlag =true;
            $timeout(function(){
                $scope.liveAnimationFlag =false;
            },10000);
        }
    }, true);

    $scope.seriesOne = [];
    $scope.seriesTwo =[];
    $scope.seriesThree = [];
    $scope.ticketPrice=0.00;


    $scope.clearInputBox=function(){
        $scope.seriesOne = [];
        $scope.seriesTwo = [];
        $scope.seriesThree = [];
    };
    $scope.totalBoxSum1 = 0;
    $scope.totalBoxSum2 = 0;
    $scope.totalBoxSum3 = 0;
    $scope.sumOfBox = 0;

    $scope.totalTicketBuy1 = 0;
    $scope.totalTicketBuy2 = 0;
    $scope.totalTicketBuy3 = 0;
    $scope.sumOfTicketPurchased = 0;
  
    $scope.getTotalBuyTicket=function(gameInputValue,srNo){
        var mrp=0;
        var sum=0;
        if(gameInputValue!= undefined){
            for(var idx = 0;idx < 10;idx++){
                if(gameInputValue[idx]!=undefined && gameInputValue[idx]){
                    sum= sum + parseInt(gameInputValue[idx]);
                }
            }
        } 
        
        if(angular.isArray($scope.allSeriesList)){
            $scope.ticketPrice = $scope.allSeriesList[srNo].mrp;
            if(srNo==0){
                $scope.totalBoxSum1=sum;
                $scope.totalTicketBuy1=$scope.totalBoxSum1 * $scope.ticketPrice;
            }else if(srNo==1){
                $scope.totalBoxSum2=sum;
                $scope.totalTicketBuy2=$scope.totalBoxSum2 * $scope.ticketPrice;
            }else if(srNo==2){
                $scope.totalBoxSum3=sum;
                $scope.totalTicketBuy3=$scope.totalBoxSum3 * $scope.ticketPrice;
            }
        }
        $scope.sumOfBox = $scope.totalBoxSum1 + $scope.totalBoxSum2 + $scope.totalBoxSum3;
        $scope.sumOfTicketPurchased = $scope.totalTicketBuy1 + $scope.totalTicketBuy2 + $scope.totalTicketBuy3;
    };  


    $scope.$watch("seriesOne", function() {
        $scope.getTotalBuyTicket($scope.seriesOne,0)
    }, true);

    $scope.$watch("seriesTwo", function() {
        $scope.getTotalBuyTicket($scope.seriesTwo,1)
    }, true);

    $scope.$watch("seriesThree", function() {
        $scope.getTotalBuyTicket($scope.seriesThree,2)
    }, true);

    $scope.printTicketCheck = false;

    
    $scope.submitGameValues=function (seriesOne,seriesTwo,seriesThree) {

        if($scope.hour>=21){
            var alertTitle = 'Server Error';
            var alertDescription ="";
            $scope.showAlert(this.ev,alertTitle,alertDescription);
            $scope.disableSubmitButton = false;
            return;
        }

        $scope.totalColumnToPrintReceipt = 5;
        $scope.disableSubmitButton = true;
        var userId = $scope.users.userId;
        if($scope.drawTimeList!= undefined){
            var drawId  = $scope.drawTimeList.id;
        }else{
            $scope.showAlert(this.ev,'Draw time missing','');
            $scope.disableSubmitButton = false;
            return;
        }
        if(!$scope.users.userId){
            var alertTitle = 'Please login';
            var alertDescription ="";
            $scope.showAlert(this.ev,alertTitle,alertDescription);
            $scope.disableSubmitButton = false;
            return;
        }
        var masterData=[];
        for(var i=0;i<10;i++){
            if(seriesOne[i]){
                masterData.push({ "play_series_id": 1, "input_box": i, "input_value": seriesOne[i]});
            }
        }
        
        for(var i=0;i<10;i++){
            if(seriesTwo[i]){
                masterData.push({ "play_series_id": 2, "input_box": i, "input_value": seriesTwo[i]});
            }
        }
        for(var i=0;i<10;i++){
            if(seriesThree[i]){
                masterData.push({ "play_series_id": 3, "input_box": i, "input_value": seriesThree[i]});
            }
        }
        if(masterData.length == 0){
            var alertTitle = 'Input is not valid';
            var alertDescription ="";
            $scope.showAlert(this.ev,alertTitle,alertDescription);
            $scope.disableSubmitButton = false;
            return;
        }
               
        var balance=$scope.loggedInTerminalBalance.current_balance;
        
        var purchasedTicket=$rootScope.roundNumber($scope.sumOfTicketPurchased,2);
       
        if(purchasedTicket > balance) {
            var alertTitle = 'Sorry account balance is low';
            var alertDescription ="";
            $scope.showAlert(this.ev,alertTitle,alertDescription);
            $scope.disableSubmitButton = false;
            return;
        }

        $scope.playSeriesId1 = alasql("select * from ? where play_series_id = ?",[masterData,1]);
        $scope.playSeriesId2 = alasql("select * from ? where play_series_id = ?",[masterData,2]);
        $scope.playSeriesId3 = alasql("select * from ? where play_series_id = ?",[masterData,3]);

        $scope.inputDetails = masterData;

        // $timeout(function() {
        //     var htmlToPrint = document.getElementById("receipt-div").innerHTML;
        //     var newWin = window.document.write(htmlToPrint);
        //     window.print();
        //     location.reload();
        //     // window.print();
        //
        // }, 1000);
        //
        // return;
        
        var request = $http({
            method: 'POST',
            url: api_url+"/v1/saveGameInputDetails",
            dataType:JSON,
            data: {
                userId: userId,
                playDetails: masterData
                ,drawId: drawId
                ,purchasedTicket: purchasedTicket
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function(response){
            $scope.reportArray = response.data;
            if($scope.reportArray.success == 1){

                if($scope.printTicketCheck) {

                    $timeout(function () {
                        var htmlToPrint = document.getElementById("receipt-div").innerHTML;
                        var newWin = window.document.write(htmlToPrint);
                        window.print();
                        location.reload();
                        // window.print();

                    }, 1000);
                }

                // $timeout(function() {
                //     $rootScope.huiPrintDiv('receipt-div','test_style.css',1);
                // }, 1000);

                $scope.showAlert(this.ev,"Print done",'');
                $scope.loggedInTerminalBalance.current_balance = $scope.reportArray.current_balance;
                $scope.clearInputBox();
                $scope.disableSubmitButton=false;
            }
        });

    };

});
