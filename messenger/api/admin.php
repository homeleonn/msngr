<?php 
use messenger\{AdvisorMessenger, Listener};

$advisorMessenger = new AdvisorMessenger;
$listener = new Listener($advisorMessenger);

// if ($listener->isFirstConnect()) {
	// Listener::json($advisorMessenger->read());
// }

if (isset($_POST['message']) && isset($_POST['client_id'])) {
	$listener->addMessage($_POST['message'], $_POST['client_id']);
}

$listener->listen();