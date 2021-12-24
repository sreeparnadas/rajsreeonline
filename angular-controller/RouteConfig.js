
app.config(function($routeProvider){
    $routeProvider.
    when("/",{
        templateUrl : "ng-views-template/welcome.html",
        controller: "PlayController"
    }).when("/terminal",{
        templateUrl : "ng-views-template/terminal.html",
        controller: "terminalController",
        authenticated : true
    }).when("/admin",{
        templateUrl : "ng-views-template/admin.html",
        controller: "adminController",
        authenticated : true
    }).when("/stockistPanel",{
        templateUrl : "ng-views-template/stockist_home.html",
        controller: "StockistHomeController",
        authenticated : true
    }).when("/stockist",{
        templateUrl : "ng-views-template/stockist.html",
        controller: "StockistCtrl",
        authenticated : true
    }).when("/terminal",{
        templateUrl : "ng-views-template/terminal.html",
        controller: "TerminalCtrl",
        authenticated : true
    }).when("/stlim",{
        templateUrl : "ng-views-template/stockist_limit.html",
        controller: "StockistLimitCtrl",
        authenticated : true
    }).when("/trlim",{
        templateUrl : "ng-views-template/terminal_limit.html",
        controller: "TerminalLimitCtrl",
        authenticated : true
    }).when("/payout",{
        templateUrl : "ng-views-template/payout_setting.html",
        controller: "PayoutSettingCtrl",
        authenticated : true
    }).when("/manualresult",{
        templateUrl : "ng-views-template/manual_result.html",
        controller: "ManualResultCtrl",
        authenticated : true
    }).when("/custSalesReportCtrl",{
        templateUrl : "ng-views-template/customer_sale_report.html",
        controller: "CustomerSaleReportCtrl",
        authenticated : true
    }).when("/barcodereport",{
        templateUrl : "ng-views-template/barcode_report.html",
        controller: "BarcodeReportCtrl",
        authenticated : true
    }).when("/drawreport",{
        templateUrl : "ng-views-template/draw_report.html",
        controller: "DrawReportCtrl",
        authenticated : true
    }).when("/terminalreport",{
        templateUrl : "ng-views-template/report_terminal.html",
        controller: "ReportTerminalCtrl"
    }).when("/result",{
        templateUrl : "ng-views-template/result.html",
        controller: "ResultCtrl",
        authenticated : true
    }).when("/message",{
        templateUrl : "ng-views-template/message.html",
        controller: "ResultCtrl",
        authenticated : true
    }).when("/DisplayEvent", {
        templateUrl: "ng-views-template/show_event.html",
        controller: "ShowDisplayController"
    }).when("/addresult", {
        templateUrl: "ng-views-template/emergency_result.html",
        controller: "EmergencyResultCtrl",
        authenticated : true
    }).when("/helpTerminal", {
        templateUrl: "ng-views-template/help_terminal.html",
        controller: "HelpTerminalCtrl",
        authenticated : true
    }).otherwise ({
        redirectTo: '/'
    });
});

app.run(["$rootScope","$location","authFact",function($rootScope,$location,authFact){
    $rootScope.$on('$routeChangeStart',function(event,next,current){
       // If route is authenticated then the user should have an accesstoken
       if(next.$$route.authenticated){
           var userAuth = authFact.getAccessToken();
           if(!userAuth){
               $location.path('/');
           }
       }
    })
}]);

