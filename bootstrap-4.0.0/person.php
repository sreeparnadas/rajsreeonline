<?php
$servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "marigold";
// learn more on PDO
//https://www.w3resource.com/php/pdo/php-pdo.php
try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $conn->prepare("select cust_id,cust_name as person_name, cust_phone as mobile_no, city as sex from customer_master");
    $stmt->execute();

    // set the resulting array to associative
    $result = $stmt->setFetchMode(PDO::FETCH_OBJ);
    $x=$stmt->fetchAll();
    $persons=array();
    $person=array();
    $sl=0;
   foreach($x as $k=>$v){
      $person['SL']=++$sl;
      $person['Name']=$v->person_name;
      $person['Mobile']=$v->mobile_no;
      $person['Sex']=$v->sex;
      $persons[]=$person;
   }
   $report_array['records']=$persons;
   echo json_encode($report_array);
}
catch(PDOException $e) {
    echo "Error: " . $e->getMessage();

}
$conn = null;
?>