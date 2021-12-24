<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Model\NextGameDraw;
use App\Model\DrawMaster;
use App\Model\StockistToTerminal;
use App\Model\PlayMaster;
use App\Model\ClaimDetails;
use Exception;
use Illuminate\Support\Carbon;

class CentralFunctionController extends Controller
{

    function createNewResult(){

        DB::beginTransaction();
            try
            {
               $nextGameDrawData = NextGameDraw::first();
               $nextDrawId = $nextGameDrawData->next_draw_id;
               $lastDrawId = $nextGameDrawData->last_draw_id;
               DB::update('UPDATE draw_masters SET active = IF(serial_number = ?, 1,0)', [$nextDrawId]);
               $newData = DB::statement(
                   'CALL insert_game_result_details('.$lastDrawId.')'
                );
               $currentDate = Carbon::now()->format('Y-m-d');
               $terminalPrizeValue = DB::select("select terminal_id, sum(prize_value)as prize_value
               from (select play_masters.id,barcode_number,get_prize_value_of_barcode(barcode_number) as prize_value,terminal_id,is_claimed
               from play_masters where draw_master_id=? and date(play_masters.created_at)=?)
               as table1 where prize_value>0 and is_claimed=0 group by terminal_id",[$lastDrawId,$currentDate]);

               foreach($terminalPrizeValue as $row){
                   $terminalId = $row->terminal_id;
                   $prizeValue = $row->prize_value;
                   StockistToTerminal::where('terminal_id', $terminalId)
                       ->update(array(
                           'current_balance' => DB::raw( 'current_balance +'.$prizeValue)
                       ) );
               }
                $barcodeWiseClaimDetails = DB::select("select *
                from (select id,barcode_number,get_prize_value_of_barcode(barcode_number) as prize_value,terminal_id,is_claimed
                from play_masters where draw_master_id=? and date(created_at)=?)
                as table1 where prize_value>0 and is_claimed=0;",[$lastDrawId,$currentDate]);

                
                foreach($barcodeWiseClaimDetails as $row){
                    $terminalId = $row->terminal_id;
                    $prizeValue = $row->prize_value;
                    $barcode = $row->barcode_number;
                    $playMasterId = $row->id;
                    $playMasterObj = new PlayMaster();
                    $playMasterObj->where('barcode_number', $barcode)
                        ->update(['is_claimed'=>1]);
                   $claimDetailsObj = new ClaimDetails();
                   $claimDetailsObj->game_id = 1;
                   $claimDetailsObj->play_master_id = $playMasterId;
                   $claimDetailsObj->terminal_id = $terminalId;
                   $claimDetailsObj->prize_value = $prizeValue;
                   $claimDetailsObj->save();
                }

               $totalDraw = DrawMaster::count();
               if($nextDrawId==$totalDraw)
                   $nextDrawId = 1;
               else
                   $nextDrawId = $nextDrawId + 1;

               if($lastDrawId==$totalDraw)
                   $lastDrawId = 1;
               else
                   $lastDrawId = $lastDrawId + 1;
               NextGameDraw::where('id',1)
               ->update(['next_draw_id' => $nextDrawId, 'last_draw_id' => $lastDrawId]);
                DB::commit();
            }

            catch (Exception $e)
            {
                DB::rollBack();
                return response()->json(array('msg' => $e->getMessage().'<br>File:-'.$e->getFile().'<br>Line:-'.$e->getLine()),401);
            }

           return response()->json(['nextDrawId'=> $nextDrawId,'totalDraw'=>$totalDraw], 200);
            
    }


//    function createNewResult(){
//
//        DB::beginTransaction();
//        try
//        {
//
//            $barcodeWiseClaimDetails = DB::select("select *
//                from (select id,barcode_number,get_prize_value_of_barcode(barcode_number) as prize_value,terminal_id,is_claimed
//                from play_masters where draw_master_id=1 and date(created_at)='2020-06-09')
//                as table1 where prize_value>0 and is_claimed=0;",[$lastDrawId,$currentDate]);
//
//            foreach($barcodeWiseClaimDetails as $row){
//                $terminalId = $row->terminal_id;
//                $prizeValue = $row->prize_value;
//                $barcode = $row->barcode_number;
//                $playMasterId = $row->id;
//                PlayMaster::where('barcode_number', $barcode)
//                    ->update(['is_claimed'=>1]);
//                $claimDetailsObj = new ClaimDetails();
//                $claimDetailsObj->game_id = 1;
//                $claimDetailsObj->play_master_id = $playMasterId;
//                $claimDetailsObj->terminal_id = $terminalId;
//                $claimDetailsObj->prize_value = $prizeValue;
//                $claimDetailsObj->save();
//            }
//            DB::commit();
//        }
//
//        catch (Exception $e)
//        {
//            DB::rollBack();
//            return response()->json(array('msg' => $e->getMessage().'<br>File:-'.$e->getFile().'<br>Line:-'.$e->getLine()),401);
//        }
//
//        return response()->json(['nextDrawId'=> $nextDrawId,'totalDraw'=>$totalDraw], 200);
//    }


	function get_current_year($separator="/"){
		list($day, $month, $year) = explode("/", date("d/m/Y"));
		return $year;
	}

	function get_current_month($separator="/"){
		list($day, $month, $year) = explode("/", date("d/m/Y"));
		return $month;
	}

	function get_financial_year($year=0,$month=0){

		$date=array();
		$date=getdate();
		if($year==0 && $month==0){
			$year = $this->get_current_year();
			$month = $this->get_current_month();
		}
		if($year>0 && $year<100){
			$year=2000+$year;
		}
		if($year){
			$date['year']=$year;
		}
		if($month){
			$date['mon']=$month;
		}
		$date['year']=$year;
		$date['year']=$date['year']%100;
		$fy=0;
		if($date['mon']>=1 && $date['mon']<=3){
			$fy=($date['year']-1)*100+$date['year'];
		}else{
			$fy=($date['year']*100)+$date['year']+1;
		}
		return $fy;
    }

}
