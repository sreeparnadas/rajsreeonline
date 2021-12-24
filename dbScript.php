<?php
$servername = "localhost";
$username = "root";
$password = "sukantahui";
$dbname = "nigh71_nightteer_db";
// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);
// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

$sql = "INSERT INTO `draw_details` (`draw_details_id`, `draw_master_id`, `fr_value`, `sr_value`, `record_date`, `record_time`) VALUES
('teer', 12, , NULL, '2020-05-09', '2020-05-09 17:34:21')";
if (mysqli_query($conn, $sql)) {
    echo "Payout set";
} else {
    echo "Error: " . $sql . "<br>" . mysqli_error($conn);
}
mysqli_close($conn);
?>


