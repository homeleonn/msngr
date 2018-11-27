<?php

namespace messenger;

class Messenger
{
	protected $filename = __DIR__ . '/data.txt';
	protected $clients;
	
	public function __construct($filename = null, $lastAccess = null)
	{
		//Listener::json(['error' => 1]);
		if (!is_null($filename)) {
			$this->filename = $filename;
		}
		
		$this->clients = $this->getData($lastAccess) ?: [];
	}
	
	public function removeClientOnId($clientId)
	{
		if (isset($this->clients[$clientId])) {
			unset($this->clients[$clientId]);
		}
	}
	
	/**
	 *  save client data
	 */
	public function save()
	{
		file_put_contents($this->filename, empty($this->clients) ? '' : serialize($this->clients), LOCK_EX);
	}
	
	public static function isAdvisor(): bool
	{
		return !is_null(s('admin'));
	}
	
	protected function getData($lastAccess)
	{
		if (!file_exists($this->filename)) {
			throw new \Exception("Datafile '{$this->filename}' not exists.");
		}
		
		if ($lastAccess && $lastAccess > filemtime($this->filename)) {
			return false;
		}
		
		$data = file_get_contents($this->filename);
		
		return $data ? unserialize($data) : false;
	}
	
	/**
	 *  Get new messages
	 *  
	 *  @param $client client data
	 *  @param $lastAccess last review timestamp
	 *  
	 *  @return list of new messages
	 */
	public function getMessages($client, $lastAccess, $maxMessagesCount = 10): array
	{
		if (!isset($client['messages'])){
			return [];
		}
		
		$newMessages = [];
		foreach (array_reverse($client['messages']) as $message) {
			if ($message['ts'] > $lastAccess) {
				$newMessages['messages'][] = $message;
				if(!--$maxMessagesCount) break;
			}
		}
		if (isset($newMessages['messages']))
			$newMessages['messages'] = array_reverse($newMessages['messages']);
		
		return $newMessages;
	}
	
	public function getNewData(bool $firstAccess)
	{
		return static::getNewMessages($firstAccess ? 0 : null);
	}
	
	public static function getNewItems($items, $lastAccess, $maxItemsCount = 10): array
	{
		if (!$items) {
			return [];
		}
		$newItems = [];
		foreach (array_reverse($items) as $item) {
			if ($item['ts'] > $lastAccess) {
				$newItems[] = $item;
				if($maxItemsCount != -1 && !--$maxItemsCount) break;
			}
		}
		if ($newItems){
			$newItems = array_reverse($newItems);
		}
		
		return $newItems;
	}
}