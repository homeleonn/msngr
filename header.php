<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title><?=$title??'messenger'?></title>
	<link rel="stylesheet" href="<?=msngrUri()?>assets/css/bootstrap.min.css">
</head>
<body>
	<ul class="menu">
		<li>
			<a href="<?=msngrUri()?>">Main</a>
		</li>
		<li>
			<a href="<?=msngrUri('1')?>">page1</a>
		</li>
		<li>
			<a href="<?=msngrUri('2')?>">page2</a>
		</li>
	</ul>