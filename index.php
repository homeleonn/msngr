<?php
$start = microtime(true);
define('ROOT', __DIR__ . '/');

require_once 'autoload.php'; 
require_once 'functions.php';
//dd(unserialize('a:1:{i:1;a:6:{s:3:"geo";s:7:"-, -, -";s:7:"referer";s:141:"Прямой вход по адресу сайта, на страницу <a href="http://localhost/test/test/">Главная(messenger)</a>";s:2:"ip";s:3:"::1";s:11:"transitions";a:1:{i:0;a:3:{s:4:"time";i:1542399239;s:3:"url";s:27:"http://localhost/test/test/";s:5:"title";s:25:"Главная(messenger)";}}s:4:"time";s:15:"1542416005.6803";s:8:"messages";a:8:{i:0;a:3:{s:4:"time";s:15:"1542399241.4987";s:4:"from";s:6:"client";s:7:"message";s:3:"555";}i:1;a:3:{s:4:"time";s:15:"1542399245.0421";s:4:"from";s:6:"client";s:7:"message";s:11:"&lt;img&gt;";}i:2;a:3:{s:4:"time";s:15:"1542403200.2401";s:4:"from";s:6:"client";s:7:"message";s:2:"55";}i:3;a:3:{s:4:"time";s:15:"1542403205.4436";s:4:"from";s:7:"advisor";s:7:"message";s:3:"154";}i:4;a:3:{s:4:"time";s:15:"1542412364.0147";s:4:"from";s:7:"advisor";s:7:"message";s:4:"1111";}i:5;a:3:{s:4:"time";s:15:"1542412370.1287";s:4:"from";s:6:"client";s:7:"message";s:4:"2222";}i:6;a:3:{s:4:"time";s:15:"1542413249.5510";s:4:"from";s:6:"client";s:7:"message";s:6:"ghncvn";}i:7;a:3:{s:4:"time";s:15:"1542413264.5415";s:4:"from";s:7:"advisor";s:7:"message";s:8:"vbmvbmnn";}}}}'));
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

