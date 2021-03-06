<?php

namespace messenger;

class ClientMessenger extends Messenger
{
	private $client;
	
	public function __construct($filename = null)
	{
		parent::__construct($filename);
		$clientId = $this->generateClientId($this->clients);
		if (!isset($this->clients[$clientId])) {
			$this->clients[$clientId] = [];
		}
		$this->client =& $this->clients[$clientId];
	}
	
	/**
	 *  Save data about client transition on site
	 *  
	 *  @param $title page title on which client is located
	 *  @param string|bool $referer link on referer
	 *  
	 */
	public function transition(): void
	{
		$params = ['title', 'referer'];
		foreach ($params as $param) {
			$$param = $_GET[$param] ?? null;
		}
		
		if (empty($this->client)) {
			$this->client = $this->setInitData($referer);
			if (!$title) $title = $_SERVER['HTTP_REFERER'];
			$this->client['referer'] .= ', на страницу <a href="'.$_SERVER['HTTP_REFERER'].'">'.$title.'</a>';
		}
		
		if (!$this->isRefresh(end($this->client['history'])['url'])) {
			$this->client['history'][] = [
				'ts' 	=> time(),
				'url' 	=> $_SERVER['HTTP_REFERER'],
				'title' => $title
			];
		}
		
		$this->save(false);
	}
	
	/**
	 *  Append new message
	 *  
	 *  @param $message message text
	 */
	public function addMessage(string $message): void
	{
		if ($remain = $this->isSpam()) {
			Listener::json(['error' => 'spam', 'wait' => $remain]);
		}
		
		$clearMessage = htmlspecialchars(substr($message, 0, 1000));
		
		$this->client['messages'][] = [
			'ts' 		=> mt(),
			'from' 		=> 'client',
			'message' 	=> $clearMessage
		];
	}
	
	/**
	 *  {@inheritdoc}
	 */
	public function getNewMessages($lastAccess = NULL, $save = true)
	{
		if (is_numeric($lastAccess)) {
			$this->client['last_access'] = $lastAccess;
		}
		$messages = parent::getMessages($this->client, $this->client['last_access']);
		
		if (!empty($messages['messages'])) {
			if ($save) {
				$this->save();
			}
			return $messages;
		}
		
		return false;
	}
	
	public function getNewData(bool $firstConnect)
	{
		$data = parent::getNewData($firstConnect);
		return $data;
	}
	
	public function isSpam()
	{
		if (isset($this->client['messages']) && count($this->client['messages']) > 5) {
			$timeout = $i = 0;
			$tmp = time();
			foreach (array_reverse($this->client['messages']) as $msg) {
				$timeout += abs($tmp - $msg['ts']);
				$tmp = $msg['ts'];
				if (++$i >= 5) break;
			}
			
			if ($timeout < 60) return 60 - $timeout;
		}
		
		return false;
	}
	
	private function setInitData($referer)
	{
		$mt = mt();
		$ip = $this->ipCollect();
		try {
			$geo = isDebug() ? '---' : $this->geo($ip);
			$geoString = is_array($geo) ? "{$geo['city_name']}, {$geo['region_name']}, {$geo['country_name']}" : '';
		} catch (\Exception $e) {
			$geoString = $e->getMessage();
		}
		
		return [
			'geo' 			=> $geoString,
			'referer' 		=> $referer ? 'Переход на сайт по ссылке ' . $referer : 'Прямой вход по адресу сайта',
			'ip' 			=> $ip,
			'history' 	=> [],
			'first_access' 	=> $mt,
			'last_access' 	=> $mt
		];
	}
	
	/**
	 *  Generate client id if not exists
	 *  
	 *  @param array $clients clients list
	 *  
	 *  @return client id
	 */
	private function generateClientId(array &$clients): string
	{
		if (!$clients) {
			$clientId = 1;
			s('cId', $clientId);
		} else {
			if (!is_null(s('cId'))) {
				$clientId = s('cId');
			} else {
				$clientId = max(array_keys($clients)) + 1;
				s('cId', $clientId);
			}
		}
		
		return (string)$clientId;
	}
	
	/**
	 *  {@inheritdoc}
	 */
	public function save(bool $saveTime = true): void
	{
		if ($saveTime) {
			$this->client['last_access'] = mt();
		}
		
		parent::save();
	}
	
	/**
	 *  Check user transition, has the link changed
	 *  
	 *  @param string $lastUrl url string
	 */
	private function isRefresh($lastUrl): bool
	{
		return $lastUrl == $_SERVER['HTTP_REFERER'];
	}
	
	private function geo($ip){
		$url = 'https://ip-location.icu/api/v1/city/?apiKey=' . env('GEO_KEY') . '&ip=' . $ip;
		$response = json_decode(file_get_contents($url), true);

		if((isset($response['error']))){
			throw new Exception($response['error']);
		}

		return $response;
	}
	
	private function ipCollect(){
		if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
			$ip = $_SERVER['HTTP_CLIENT_IP'];
		} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
			$ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
		} else {
			$ip = $_SERVER['REMOTE_ADDR'];
		}
		
		return $ip;
	}
	
}