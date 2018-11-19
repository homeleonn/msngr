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
	
	/**
	 *  Read new clients data
	 *  
	 *  @param $firstAccess		very first request(open|refresh page)
	 *  @param $clientId		
	 *  @param $needData 		true if we don't know init data about client
	 *  @param $lastCircle 		last request in pending cycle
	 *  
	 *  @return list clients with new data
	 */
	public function read(bool $firstAccess, ?int $clientId = null, bool $needData = false, bool $lastCircle = false,   $initTime = false): array
	{
		if (!$this->clients) return false;
	
		$time 			= time();
		$deletion 		= false;
		$forced 		= $firstAccess || $needData;
		$lastAccess 	= $forced ? 0 : s('admin');
		$clientsOnlineResult = [];
		//d(12);
		foreach ($this->clients as $id => $client) {
			// if ($this->removeOldClient($id, &$deletion, $time)) continue;
			$clientsOnline 		= [];
			$selectedClient 	= $clientId == $id;
			$argsForMessages 	= [$client, $lastAccess];
			if ($selectedClient) {
				$clientsOnline = array_merge(
					$clientsOnline, 
					$forced ? $this->getMeta($id) : []
				);
			} else {
				$argsForMessages[] = 1;
			}
			
			$messages = call_user_func_array(['parent', 'getMessages'], $argsForMessages);
			if ($messages) {
				$clientsOnline['messages'] = $messages['messages'];
			}
			//d($initTime);
			if ($clientsOnline || $forced || ($lastCircle && $selectedClient)) {
				if ($history = $this->getHistory($id, $initTime && $initTime < $lastAccess ? $initTime : $lastAccess)) {
					$clientsOnline['history'] = $history;
				}
			}
			
			if ($clientsOnline || $forced) {
				$clientsOnlineResult['clients'][$id] = (object)$clientsOnline;
			}
				
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
		return $history ?: [];
	}
	
	private function removeOldClient($clientId, &$deletion, $time){
		// Don't show clients which last connect 120 seconds ago or more
		if ($this->clients[$clientId]['last_access'] < $time - 120) {
			// Remove clients which last connect 10 minutes ago or more
			if ($this->clients[$clientId]['last_access'] < $time - 600) {
				unset($this->clients[$clientId]);
				$deletion = true;
			}
			return true;
		}
		return false;
	}
	
	public function getNewData(bool $firstConnect, bool $lastCircle = false, $initTime = false): array
	{
		return $this->read($firstConnect, s('selected_client_id'), isset($_GET['need_data']), $lastCircle, $initTime);
	}
	
	public function transition()
	{
		return false;
	}
}