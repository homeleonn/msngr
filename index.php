<?php
$start = microtime(true);
define('ROOT', __DIR__ . '/');

require_once 'autoload.php'; 
require_once 'functions.php';

$pages = [
	'home' => [
		'title' => 'Главная(messenger)',
		'content' => '<h1>Hello from main page</h1>',
	],
	'1' => [
		'title' => 'Страница 1 - Мессенжер',
		'content' => '<h1>Hello from 1</h1>',
	],
	'2' => [
		'title' => 'Страница 2 - Мессенжер',
		'content' => '<h1>Hello from 2</h1>',
	],
	'messenger/admin' => [
		'title' => 'Панель администратора',
		'content' => '<h1>Hello from Admin</h1>',
		'templateName' => 'messenger/templates/admin',
		'layout' => '1'
	],
	
	'messenger/api/admin' => [
		'templateName' => 'messenger/api/admin',
		'layout' => '1'
	],
	
	// Нужно проверять заголовок на ajax
	'messenger/api/client' => [
		'templateName' => 'messenger/api/client',
		'layout' => '1'
	],
	
	'test' => function(){
		echo 'hello world';
	},
];



$page = URI == '' ? 'home' : URI;

//dd(ROOT, URI, ROOT_URL, $page, ROOT_URI, $_SERVER);



if (!isset($pages[$page])) {
	header("HTTP/1.0 404 Not Found");
	exit('<h1>Page Not Found</h1>');
} else {
	if (is_callable($pages[$page])) {
		$pages[$page]();
	} else {
		view($pages[$page]['templateName'] ?? NULL, $pages[$page]);
	}
	
}

