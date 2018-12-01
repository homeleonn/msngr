<?php

function msngrUri(){
	static $uri;
	if (!$uri)
		$uri = str_replace($_SERVER['DOCUMENT_ROOT'], '', str_replace('\\', '/', __DIR__)) . '/';
	
	return $uri;
}

function isOn(){
	$state = file(__DIR__ . '/on.txt')[0];
	return is_numeric($state) && (int)$state > time() - 30 * 60;
}

if (isOn())
	include __DIR__ . '/messenger/templates/client.php';