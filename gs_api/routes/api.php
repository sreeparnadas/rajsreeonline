<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::group(array('prefix' => 'v1'), function() {

    Route::post('/login','PersonController@validateCredential');
    Route::post('/checkAuthenticatedUser','PersonController@checkAuthenticatedUser');
    Route::post('/logout','PersonController@logOutUser');
    Route::get('/getServerTime','PersonController@getCurrentTimestamp');
    Route::get('/getPlaySeries','PlaySeriesController@getPlaySeries');
    Route::get('/person/{id}/getBalance','StockistToTerminalController@getTerminalBalance');
    Route::get('/getActiveDraw','DrawMasterController@getActiveDrawTime');
    Route::get('/getAllDrawTimes','DrawMasterController@getAllDrawTimes');
    Route::get('/getMessage','GameMessageController@getSiteNotification');
    Route::post('/getTerminalBalance','PersonController@getLoggedInTerminalBalance');
    Route::post('/generateNewResultAndDraw','CentralFunctionController@createNewResult');
    Route::get('/getNextDrawNumber','NextGameDrawController@getIncreasedValue');
    Route::get('/getPreviousResult','ResultDetailsController@getPreviousDrawResult');
    Route::post('/getResultsByDate','ResultDetailsController@getResultsByDate');
    Route::post('/resetPassword','StockistToTerminalController@resetTerminalPassword');


});

Route::group(['prefix' => 'v1',  'middleware' => 'authCheck'], function()
{
    Route::post('/saveGameInputDetails','PlayMasterController@saveGameInputDetails');

    // stockist
    Route::get('/getAllStockists','StockistController@getAllStockists');
    Route::get('/selectNextStockistId','StockistController@selectNextStockistId');
    Route::post('/saveNewStockist','StockistController@saveNewStockist');
    Route::post('/updateStockistDetails','StockistController@updateStockistDetails');
    Route::post('/saveStockistRechargeData','RechargeToStockistController@saveStockistRechargeData');

    Route::post('/resetAdminPassword','PersonController@resetAdminPassword');

    // terminal
    Route::get('/getAllTerminals','StockistToTerminalController@getAllTerminals');
    Route::post('/selectNextTerminalId','StockistToTerminalController@selectNextTerminalId');
    Route::post('/saveNewTerminal','StockistToTerminalController@saveNewTerminal');
    Route::post('/updateTerminalDetails','StockistToTerminalController@updateTerminalDetails');
    Route::post('/saveTerminalRechargeData','RechargeToTerminalController@saveTerminalRechargeData');

    Route::post('/setGamePayout','PlaySeriesController@setGamePayout');
    Route::get('/getDrawTimeForManualResult','ManualResultDigitController@getDrawTimeForManualResult');
    Route::post('/saveManualResult','ManualResultDigitController@saveManualResult');
    Route::get('/getLastInsertedManualResult','ManualResultDigitController@getLastInsertedManualResult');
    Route::post('/updateCurrentManual','ManualResultDigitController@updateCurrentManual');

    //    report
    Route::post('/getTerminalTotalSaleReport','RechargeToTerminalController@getTerminalTotalSaleReport');
    Route::post('/getAllBarcodeReportByDate','RechargeToTerminalController@getAllBarcodeReportByDate');
    Route::post('/getBarcodeInputDetails','RechargeToTerminalController@getBarcodeInputDetails');
    Route::post('/drawWiseReport','RechargeToTerminalController@drawWiseReport');
    Route::post('/getResultByDate','ResultMasterController@getResultByDate');
    Route::post('/terminalReportDetails','RechargeToTerminalController@terminalReportDetails');
    Route::post('/barcodeReportFromTerminal','RechargeToTerminalController@barcodeReportFromTerminal');
    Route::post('/getTotalBoxInput','RechargeToTerminalController@getTotalBoxInput');

    Route::post('/addNewMessage','GameMessageController@addNewMessage');
    Route::get('/selectMissedOutDrawTime','DrawMasterController@selectMissedOutDrawTime');
    Route::post('/insertMissedOutResult','ResultMasterController@insertMissedOutResult');
    Route::post('/activateCurrentDrawManually','DrawMasterController@activateCurrentDrawManually');

    Route::post('/claimBarcodeManually','PlayMasterController@claimBarcodeManually');


});

Route::get('/clear-cache', function() {
    Artisan::call('cache:clear');
    Artisan::call('route:clear');
    Artisan::call('config:clear');
    return "Cache is cleared";
});


