<?php
session_start();
ini_set('date.timezone', 'Europe/Kiev');
ini_set('xdebug.var_display_max_depth', 50);
ini_set('xdebug.var_display_max_children', 256);
ini_set('xdebug.var_display_max_data', 1024);
ini_set('xdebug.overload_var_dump', '1');

define('ROOT_URL', env('URL'));
define('ROOT_URI', explode('//' . $_SERVER['HTTP_HOST'], ROOT_URL)[1]);
define('URI', trim(str_replace([ROOT_URI, '?'.$_SERVER['QUERY_STRING']], '', $_SERVER['REQUEST_URI']), '/'));

function env($key)
{
	static $env;
	
	if (!$env) {
		$env = require_once 'config.php';
		// $fname = ROOT . '.env';
		// $f = file($fname);
		// $line = 0;
		// foreach ($f as $envString) {
			// $envString = trim($envString);
			// if ($envString == '') {
				// continue;
			// }
			
			// $envParts = explode('=', $envString, 2);
			
			// if (!isset($envParts[1])) {
				// throw new Exception("Syntax error on enviroment file '{$fname}' on line {$line}");
			// }
			
			// $env[$envParts[0]] = $envParts[1];
			// $line++;
		// }
	}
	
	if (!isset($env[$key])) {
		throw new Exception("Env '{$key}' is not exists!");
	}
	
	return $env[$key];
}

function isDebug(){
	return env('APP_DEBUG');
}

function isOn(){
	$state = file(ROOT . 'on.txt')[0];
	return is_numeric($state) && (int)$state > time() - 30 * 60;
}

function toggleState(){
	$toggledState = isOn() ? 'off' : time();
	file_put_contents(ROOT . 'on.txt', $toggledState);
}

function timerRefresh(){
	file_put_contents(ROOT . 'on.txt', time());
}

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

function tester($fn, ...$args){
	$count = 1000;
	$start = mt();
	while(--$count){
		call_user_func_array($fn, $args);
	}
	echo 'Test duration: ', (mt() - $start), " sec.<br>";
}

function mt($decimal = 4){
	return number_format(microtime(true), $decimal, '.', '');
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
	// return !is_null(s('admin'));
	
	return isset($_SESSION['user']['accesslevel']) && $_SESSION['user']['accesslevel'] == 1;
}

function uri($path = ''){
	return ROOT_URI . ($path ? $path . '/' : '');
}

function isAjax($forPost = false) {
	if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest') {
		if (!$forPost || $_SERVER['REQUEST_METHOD'] == 'POST') {
			return true;
		}
	}
	
	return false;
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