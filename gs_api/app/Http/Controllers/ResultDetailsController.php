<?php

namespace App\Http\Controllers;

use App\Model\ResultDetails;
use Illuminate\Http\Request;
use App\Model\ResultMaster;
use App\Model\DrawMaster;
use Illuminate\Support\Facades\DB;

class ResultDetailsController extends Controller
{
    function getPreviousDrawResult(){
        $result = ResultDetails::
                    select('result_details.play_series_id','result_details.result_box'
                    ,'result_masters.single_result','result_masters.jumble_number'
                    ,'draw_masters.start_time','draw_masters.end_time'
                    ,'draw_masters.serial_number'
                    ,DB::raw("DATE_FORMAT(result_masters.game_date, '%d-%m-%Y') as draw_date"))
                    ->join('result_masters', 'result_details.result_master_id', '=', 'result_masters.id')
                    ->join('draw_masters', 'result_masters.draw_master_id', '=', 'draw_masters.id')
                    ->whereRaw("date(result_masters.created_at) = curdate()")
                    ->orderByRaw("draw_masters.serial_number DESC, result_details.play_series_id ASC")
                    ->limit(3)
                    ->get();
        echo json_encode($result,JSON_NUMERIC_CHECK);
    }

    function getResultsByDate(request $request){
        $requestedData = (object)($request->json()->all());
        $gameDate = $requestedData->gameDate;
        $result = DB::select((DB::raw("select date_format(game_date,'%d/%m/%Y') as draw_date,
                end_time,max(ap) as ap ,max(jp) as jp
                , max(sevenStar) as sevenStar,single_result,jumble_number
                from (select *,
                case when play_series_id = 1 then (result_box) end as ap ,
                case when play_series_id = 2 then (result_box) end as jp,
                case when play_series_id = 3 then (result_box) end as sevenStar
                from (select
                end_time
                ,result_details.play_series_id
                ,result_details.result_master_id
                ,serial_number
                ,result_box
                ,single_result
                ,jumble_number
                ,result_masters.game_date
                from result_details
                inner join result_masters on result_details.result_master_id = result_masters.id
                inner join draw_masters on result_masters.draw_master_id = draw_masters.id
                inner join play_series on result_details.play_series_id = play_series.id
                where result_masters.game_date = "."'".$gameDate."'".") as set1) as set2
                group by result_master_id order by serial_number DESC")));
        echo json_encode($result,JSON_NUMERIC_CHECK);
    }
}
