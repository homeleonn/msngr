<?php 
use messenger\{AdvisorMessenger, Listener};

$listener = new Listener(new AdvisorMessenger);

if (isset($_POST['message']) && isset($_POST['client_id'])) {
	$listener->addMessage($_POST['message'], $_POST['client_id']);
}

$listener->listen();