<?php

namespace messenger;

class Messenger
{
	protected $filename = __DIR__ . '/data.txt';
	protected $clients;
	
	public function __construct($filename = false)
	{
		//Listener::json(['error' => 1]);
		if ($filename) {
			$this->filename = $filename;
		}
		$this->clients = $this->getData() ?: [];
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
	
	protected function getData()
	{
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
	public function getMessages($client, $lastAccess): array
	{
		if (!isset($client['messages'])) return [];
		
		$newMessages = [];
		$countMessages = 10;
		foreach (array_reverse($client['messages']) as $message) {
			if ($message['time'] > $lastAccess) {
				$message['timestamp'] 	= $message['time'];
				$message['time'] 		= date('H:i', $message['time']);
				$newMessages['messages'][] = $message;
				if(!--$countMessages) break;
			}
		}
		if (isset($newMessages['messages']))
			$newMessages['messages'] = array_reverse($newMessages['messages']);
		return $newMessages;
	}
}