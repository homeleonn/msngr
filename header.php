<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title><?=$title??'messenger'?></title>
	<link rel="stylesheet" href="<?=uri()?>assets/css/bootstrap.min.css">
	<link rel="stylesheet" href="<?=uri()?>assets/css/send.css">
	<link rel="stylesheet" href="<?=uri()?>messenger/assets/css/style.css">
	<script>function $$(callback){window.addEventListener('load', callback);}</script>
</head>
<body>
	<ul class="menu">
		<li>
			<a href="<?=uri()?>">Main</a>
		</li>
		<li>
			<a href="<?=uri('1')?>">page1</a>
		</li>
		<li>
			<a href="<?=uri('2')?>">page2</a>
		</li>
	</ul>