<?php
use messenger\{ClientMessenger, Listener};

$messenger = new ClientMessenger;

// If add messege - write, read new, echo and exit
if (isset($_POST['message'])) {
	Listener::addMessage($messenger, $_POST['message']);
}

$messenger->transition();

Listener::listen($messenger);