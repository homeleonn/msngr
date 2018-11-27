<?php

namespace messenger;

use function s;

class Listener
{
	private $messenger;
	private $tokenKeys;
	private $isFirstConnect;
	
	public function __construct(Messenger $messenger)
	{
		$this->messenger 		= $messenger;
		$this->isFirstConnect 	= isset($_GET['first_connect']);
	}
	
	public function isFirstConnect(): bool
	{
		return $this->isFirstConnect;
	}
	
	public function generateToken()
	{
		$token =  md5(uniqid() . mt_rand(0, 9999));
		s($this->getKey('token'), $token);
		return $token;
	}
	
	private function createTokenKeys($className)
	{
		$for = stripos($className, 'client') === false ? 'admin_' : '';
		$this->tokenKeys['token'] 		 = $for . 'token';
		$this->tokenKeys['listen_token'] = $for . 'listen_token';
	}
	
	private function getKey($for)
	{
		if (!isset($this->tokenKeys[$for])) {
			throw new \Exception("Key '{$for}' not exists.");
		}
		return $this->tokenKeys[$for];
	}
	
	// Идентификатор прослушивания новых сообщений(защита от ручного запуска скрипта инициализирующего прослушку, при запуске более одного скрипта прослушки, все старые скрипты завершают свою работу)
	public function generateListenToken()
	{
		$listenToken = s($this->getKey('listen_token')) ? s($this->getKey('listen_token')) + 1 : 1;
		s($this->getKey('listen_token'), $listenToken);
		return $listenToken;
	}
	
	public function checkTokensInit()
	{
		$error = false;
	
		if 	   (is_null(s($this->getKey('token')))) 	   $error = 'Token not found';
		elseif (is_null(s($this->getKey('listen_token')))) $error = 'Listen token not found';
		
		if ($error) {
			self::json(['error' => $error]);
		}
		
		return s($this->getKey('token'));
	}
	
	public static function json($data)
	{
		exit(json_encode($data));
	}
	
	
	public function listen($timeout = 24, $step = 4)
	{
		$className		= get_class($this->messenger);
		$this->createTokenKeys($className);
		$firstCircle 	= true;
		$lastCircle 	= false;
		$time 			= time();
		$prevAccess 	= !is_null(s('admin')) ? s('admin') : $time;
		
		if ($timeout) {
			$token 			= $this->isFirstConnect ? $this->generateToken($className) : $this->checkTokensInit();
			$listenToken 	= $this->generateListenToken();
		}
		
		do {
			if (!$firstCircle) {
				$this->wait($step);
				$this->messenger = new $className;
			}
			$lastCircle = !$timeout || (time() - $time) > ($timeout - $step + 1);
			
			if ($timeout) {
				$this->checkTokenLoop($token, $listenToken);
			}
			
			if ($data = $this->messenger->getNewData($this->isFirstConnect, $firstCircle, $lastCircle, $prevAccess)) {
				self::json($data);
			}
			$firstCircle = $this->isFirstConnect = false;
		} while (time() < $time + $timeout);
		
		$this->messenger->save();
	}
	
	public function wait($sec)
	{
		header_remove('Set-Cookie');
		session_write_close();
		sleep($sec);
		session_start();
	}
	
	public function checkTokenLoop($token, $listenToken)
	{
		$checkToken = false;
		if (s($this->getKey('token')) != $token) $checkToken = ['new_token' => s($this->getKey('token'))];
		elseif (s($this->getKey('listen_token')) != $listenToken) $checkToken = ['error' => 'Lost listen token'];
		
		if ($checkToken) {
			self::json($checkToken);
		}
	}
	
	public function addMessage($message, $clientId = false)
	{
		$args = [$message];
		if ($clientId) {
			$args[] = $clientId;
		}
		call_user_func_array([$this->messenger, 'addMessage'], $args);
		self::json($this->messenger->getNewMessages(null, true));
	}
}