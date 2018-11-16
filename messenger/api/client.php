<?php
use messenger\{ClientMessenger, Listener};

$messenger = new ClientMessenger;
$listener  = new Listener($messenger);

// If add messege - write, read new, echo and exit
if (isset($_POST['message'])) {
	$listener->addMessage($_POST['message']);
}

$messenger->transition();

$listener->listen();