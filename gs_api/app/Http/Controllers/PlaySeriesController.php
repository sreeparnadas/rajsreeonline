<?php

namespace App\Http\Controllers;

use App\Model\PlaySeries;
use App\Model\Stockist;
use App\Model\StockistToTerminal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class PlaySeriesController extends Controller
{

    public function getPlaySeries(){
        $allPlaySeries = PlaySeries::all();
        echo json_encode($allPlaySeries,JSON_NUMERIC_CHECK);
    }

    public function setGamePayout(request $request){
        $requestedData = (object)($request->json()->all());
        try
        {
            foreach ($requestedData->twoDigitPayOut as $row){
                PlaySeries::where('id',$row['id'])->update(['payout'=> $row['payout']]);
            }
            DB::commit();
        }

        catch (Exception $e)
        {
            DB::rollBack();
            return response()->json(array('success' => 0, 'message' => $e->getMessage().'<br>File:-'.$e->getFile().'<br>Line:-'.$e->getLine()),401);
        }
        return response()->json(array('success' => 1, 'message' => 'Successfully recorded'),200);
    }

}
