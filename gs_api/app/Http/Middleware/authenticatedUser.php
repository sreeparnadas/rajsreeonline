<?php

namespace App\Http\Middleware;
use App\Http\Controllers\PersonController;
use Closure;

class authenticatedUser
{
    public function bearerToken()
    {
         if(isset($_SERVER['HTTP_AUTHORIZATION']))
             $headers = $_SERVER['HTTP_AUTHORIZATION'];
         if (isset($headers) && $headers != '') {
             return substr($headers, 7);
         }
    }


    public function handle($request, Closure $next)
    {
        $bearerToken = $this->bearerToken();
        $personObj = new PersonController();
        $isValidUser = $personObj->checkUnauthorizedAction($bearerToken);
        if($isValidUser == 0)
        {
            abort(403, 'Unauthorized');
        }
        else
        {
            return $next($request);
        }

    }
}
