<?php

namespace messenger;

use function s;

class Listener{
	
	public static function generateToken()
	{
		$token =  md5(uniqid() . mt_rand(0, 9999));
		s('token', $token);
		return $token;
	}
	
	// Идентификатор прослушивания новых сообщений(защита от ручного запуска скрипта инициализирующего прослушку, при запуске более одного скрипта прослушки, все старые скрипты завершают свою работу)
	public static function generateListenToken()
	{
		$listenToken = s('listen_token') ? s('listen_token') + 1 : 1;
		s('listen_token', $listenToken);
		return $listenToken;
	}
	
	public static function checkTokensInit()
	{
		$error = false;
	
		if 	   (is_null(s('token'))) 		$error = 'Token not found';
		elseif (is_null(s('listen_token'))) $error = 'Listen token not found';
		
		if ($error) {
			self::json(['error' => $error]);
		}
		
		return s('token');
	}
	
	public static function json($data)
	{
		exit(json_encode($data));
	}
	
	
	public static function listen($messenger, $timeout = 24, $step = 4)
	{
		$className		= get_class($messenger);
		$firstConnect 	= isset($_POST['firstConnect']);
		$firstCircle 	= true;
		$time 			= time();
		$token 			= isset($_POST['firstConnect']) ? Listener::generateToken() : Listener::checkTokensInit();
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
		if 	   (s('token') != $token) 			   $checkToken = ['new_token' => s('token')];
		elseif (s('listen_token') != $listenToken) $checkToken = ['error' => 'Lost listen token'];
		
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