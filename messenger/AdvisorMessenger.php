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
			'ts' 		=> mt(),
			'from' 		=> 'advisor',
			'message' 	=> $clearMessage
		];
	}
	
	/**
	 *  {@inheritdoc}
	 */
	public function getNewMessages($lastAccess = NULL, $save = true)
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
			return $newMessages;
		}
		
		return false;
	}
	
	/**
	 *  {@inheritdoc}
	 */
	public function save(bool $saveTime = true): void
	{
		if ($saveTime) {
			s('admin', mt());
		}
		parent::save();
	}
	
	public function read($firstAccess, $clientId = null, $needData = null)
	{
		if (!$this->clients) return false;
	
		$time 			= time();
		$deletion 		= false;
		$lastAccess 	= $firstAccess ? 0 : s('admin');
		$clientsOnlineResult = [];
		//dd($isSelectClient);
		foreach ($this->clients as $id => $client) {
			//$this->removeOldClient($id, &$deletion, $time);
			$clientsOnline = [];
			$argsForMessages = [$client];
			if ($clientId == $id) {
				$argsForMessages[] = $needData ? 0 : $lastAccess;
				$clientsOnline = array_merge(
					$clientsOnline, 
					$this->getHistory($id, $needData ? 0 : $lastAccess),
					$firstAccess || $needData ? $this->getMeta($id) : []
				);
			} else {
				$argsForMessages[] = $lastAccess;
				$argsForMessages[] = 1;
			}
			
			
			$messages = call_user_func_array(['parent', 'getMessages'], $argsForMessages);
			if ($messages) {
				$clientsOnline['messages'] = $messages['messages'];
			}
			if ($clientsOnline || $firstAccess)
				$clientsOnlineResult['clients'][$id] = (object)$clientsOnline;
		}
		
		if ($deletion) {
			parent::save();
		}
		s('admin', mt());
		return $clientsOnlineResult;
	}
	
	private function getMeta($clientId)
	{
		return [
			'geo' 		=> $this->clients[$clientId]['geo'],
			'referer' 	=> $this->clients[$clientId]['referer'],
			'ip' 		=> $this->clients[$clientId]['ip'],
		];
	}
	
	private function getHistory($clientId, $lastAccess)
	{
		$history = Messenger::getNewItems($this->clients[$clientId]['history'], $lastAccess);
		return $history ? ['history' => $history] : [];
	}
	
	private function removeOldClient($clientId, &$deletion, $time){
		// Don't show clients which last connect 120 seconds ago or more
		// if ($this->clients[$clientId]['last_access'] < time() - 120) {
			// Remove clients which last connect 10 minutes ago or more
			// if ($this->clients[$clientId]['last_access'] < time() - 600) {
				// unset($this->clients[$clientId]);
				// $deletion = true;
			// }
		// } else {
			// $clientsOnline[$clientId] = $client;
		// }
	}
	
	public function getNewData($firstConnect)
	{
		return $this->read($firstConnect, s('selected_client_id'), $_GET['need_data'] ?? null);
		// $data = [];
		// $clients = $this->read($firstConnect, $clientId, $isSelectClient);
		// if ($clients) $data = $clients;
		// $newData = parent::getNewData($firstConnect);
		// if ($newData) {
			// $data = array_merge($data, $newData);
		// }
		// return $data;
	}
	
	public function transition()
	{
		return false;
	}
}