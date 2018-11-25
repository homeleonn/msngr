<?php
namespace messenger\api;

use messenger\{AdvisorMessenger, Listener};

$isAddMsg = isset($_POST['message']) && isset($_POST['client_id']);
$listener = new Listener(new AdvisorMessenger(null, $isAddMsg || isset($_GET['first_connect']) ? null : \s('admin')));

if ($isAddMsg) {
	$listener->addMessage($_POST['message'], $_POST['client_id']);
}

$listener->listen(10);