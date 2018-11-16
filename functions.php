<?php
session_start();
ini_set('date.timezone', 'Europe/Kiev');
ini_set('xdebug.var_display_max_depth', 50);
ini_set('xdebug.var_display_max_children', 256);
ini_set('xdebug.var_display_max_data', 1024);
ini_set('xdebug.overload_var_dump', '1');

define('ROOT_URI', '/test/messenger/');
define('ROOT_URL', $_SERVER['REQUEST_SCHEME'] . '://' .$_SERVER['HTTP_HOST'] . ROOT_URI);
define('URI', trim(str_replace([ROOT_URI, '?'.$_SERVER['QUERY_STRING']], '', $_SERVER['REQUEST_URI']), '/'));

function vd(){
	$trace = debug_backtrace()[1];
	echo '<small style="color: green;"><pre>',$trace['file'],':',$trace['line'],':</pre></small><pre>';
	call_user_func_array('var_dump', func_get_args()[0] ?: [NULL]);
}

function d(){
	vd(func_get_args());
}

function dd(){
	vd(func_get_args());
	exit;
}

function getContentFromFile($file){
	ob_start();
	include $file;
	return ob_get_clean();
}

function view($template = NULL, $data) {
	if (!$template) {
		$template = 'template';
	}
	
	$template = ROOT . $template . '.php';
	
	if (!file_exists($template)) {
		throw new Exception("Template '{$template}' not exists.");
	}
	
	extract($data);
	if (!isset($layout)) require_once ROOT . 'header.php';
	include $template;
	if (!isset($layout)) require_once ROOT . 'footer.php';
}

function isAdmin(){
	return !is_null(s('admin'));
}

function uri($path = ''){
	return ROOT_URI . ($path ? $path . '/' : '');
}

function s($key = NULL, $value = NULL){
	if (is_null($key)) {
		return $_SESSION;
	}
	
	if (!is_null($value)) {
		$_SESSION[$key] = $value;
	}
	
	return $_SESSION[$key] ?? NULL;
}

function arrayLast(array $array){
	$lastKey = array_reverse(array_keys($array))[0];
	return $array[$lastKey];
}