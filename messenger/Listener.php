<?php

namespace messenger;

use function s;

class Listener{
	
	private static $tokenKeys;
	
	public static function generateToken()
	{
		$token =  md5(uniqid() . mt_rand(0, 9999));
		s(self::getKey('token'), $token);
		return $token;
	}
	
	private static function createTokenKeys($className)
	{
		$for = stripos($className, 'client') === false ? 'admin_' : '';
		self::$tokenKeys['token'] 		 = $for . 'token';
		self::$tokenKeys['listen_token'] = $for . 'listen_token';
	}
	
	private static function getKey($for)
	{
		if (!isset(self::$tokenKeys[$for])) {
			throw new \Exception("Key '{$for}' not exists.");
		}
		return self::$tokenKeys[$for];
	}
	
	// Идентификатор прослушивания новых сообщений(защита от ручного запуска скрипта инициализирующего прослушку, при запуске более одного скрипта прослушки, все старые скрипты завершают свою работу)
	public static function generateListenToken()
	{
		$listenToken = s(self::getKey('listen_token')) ? s(self::getKey('listen_token')) + 1 : 1;
		s(self::getKey('listen_token'), $listenToken);
		return $listenToken;
	}
	
	public static function checkTokensInit()
	{
		$error = false;
	
		if 	   (is_null(s(self::getKey('token')))) 		$error = 'Token not found';
		elseif (is_null(s(self::getKey('listen_token')))) $error = 'Listen token not found';
		
		if ($error) {
			self::json(['error' => $error]);
		}
		
		return s(self::getKey('token'));
	}
	
	public static function json($data)
	{
		exit(json_encode($data));
	}
	
	
	public static function listen($messenger, $timeout = 24, $step = 4)
	{
		$className		= get_class($messenger);
		self::createTokenKeys($className);
		$firstConnect 	= isset($_POST['firstConnect']);
		$firstCircle 	= true;
		$time 			= time();
		$token 			= isset($_POST['firstConnect']) ? Listener::generateToken($className) : Listener::checkTokensInit();
		$listenToken 	= Listener::generateListenToken();

		while (time() < $time + $timeout) {
			if (!$firstCircle) {
				self::wait($step);
				$messenger = new $className;
			}
			
			self::checkTokenLoop($token, $listenToken);
			
			$messenger->getNewMessages($firstConnect ? 0 : null, true);
			$firstCircle = $firstConnect = false;
		}
		$messenger->save();
	}
	
	public static function wait($sec)
	{
		header_remove('Set-Cookie');
		session_write_close();
		sleep($sec);
		session_start();
	}
	
	public static function checkTokenLoop($token, $listenToken)
	{
		$checkToken = false;
		if 	   (s(self::getKey('token')) != $token) 			   $checkToken = ['new_token' => s(self::getKey('token'))];
		elseif (s(self::getKey('listen_token')) != $listenToken) $checkToken = ['error' => 'Lost listen token'];
		
		if ($checkToken) {
			self::json($checkToken);
		}
	}
	
	public static function addMessage($messenger, $message, $clientId = false)
	{
		$args = [$message];
		if ($clientId) {
			$args[] = $clientId;
		}
		call_user_func_array([$messenger, 'addMessage'], $args);
		$messenger->getNewMessages(null, true);
	}
}