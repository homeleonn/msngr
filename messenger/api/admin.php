<?php 
use messenger\{AdvisorMessenger, Listener};

$messenger = new AdvisorMessenger;

if (isset($_POST['message']) && isset($_POST['client_id'])) {
	Listener::addMessage($messenger, $_POST['message'], $_POST['client_id']);
}

Listener::listen($messenger);