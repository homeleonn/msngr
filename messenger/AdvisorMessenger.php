<?php

namespace messenger;

class AdvisorMessenger extends Messenger
{
	/**
	 *  Append new message
	 *  
	 *  @param $message message text
	 *  @param int $clientId
	 */
	public function addMessage(string $message, $clientId = false)
	{
		if (!$clientId || !self::isAdvisor()) return;
		$clearMessage 	= htmlspecialchars(substr($message, 0, 2000));
		
		$this->clients[$clientId]['messages'][] = [
			'time' => mt(),
			'from' => 'advisor',
			'message' => $clearMessage
		];
	}
	
	/**
	 *  {@inheritdoc}
	 */
	public function getNewMessages($lastAccess = NULL, $save = false)
	{
		$newMessages = [];
		foreach ($this->clients as $clientId => $client) {
			$tmp = parent::getMessages($client, s('admin'));
			if (!empty($tmp)) {
				$newMessages['clients'][$clientId] = $tmp;
			}
		}
		
		if (!empty($newMessages['clients'])) {
			if ($save) {
				$this->save();
			}
			exit(json_encode($newMessages));
		}
	}
	
	/**
	 *  {@inheritdoc}
	 */
	public function save(): void
	{
		s('admin', mt());
		parent::save();
	}
	
	public function read()
	{
		$data = $this->getData();
		if (!$this->clients) return false;
	
		$deletion = false;
		$clientsOnline = [];
		foreach ($this->clients as $id => $client) {
			// // Don't show clients which last connect 120 seconds ago or more
			// if ($client['time'] < time() - 120) {
				// // Remove clients which last connect 10 minutes ago or more
				// if ($client['time'] < time() - 600) {
					// unset($this->clients[$id]);
					// $deletion = true;
				// }
			// } else {
				// $clientsOnline[$id] = $client;
			// }
			$clientsOnline[$id] = $client;
		}
		
		if ($deletion) {
			parent::save();
		}
		
		return $clientsOnline;
	}
	
	public function transition()
	{
		return false;
	}
}