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
	 *  @param $firstAccess					very first request(open|refresh page)
	 *  @param $clientId		
	 *  @param $needDataForSelectedClient 	true if we don't know init data about client
	 *  @param $lastCircle 					last request in pending cycle
	 *  @param $initTime 					time of previous last listen cycle
	 *  
	 *  @return list clients with new data
	 */
	public function read(bool $firstAccess, ?int $clientId = null, bool $needDataForSelectedClient = false, bool $firstCircle = false, bool $lastCircle = false, $initTime = 0): array
	{
		if (!$this->clients) {
			return [];
		}
	
		$time 			= time();
		$deletion 		= false;
		$lastAccess 	= $firstAccess ? 0 : s('admin');
		$clientsOnlineResult = [];
		
		foreach ($this->clients as $id => $client) {
			//if ($this->removeOldClient($id, $deletion, $time)) continue;
			$clientData 			= [];
			$selectedClient 		= $clientId == $id;
			$argsForNewClientData['last_access'] = $firstAccess ? 0 : ($firstCircle && $initTime ? $initTime: $lastAccess);
			
			if ($selectedClient) {
				if ($firstAccess || $needDataForSelectedClient) {
					if ($firstAccess) {
						$argsForNewClientData['last_access'] = 0;
					}
					$clientData = $this->getMeta($id);
				}
			}
			
			// Get messages
			$clientData = $this->getClientData($clientData, $client, 'messages', $argsForNewClientData);
			
			// Get history
			if ($clientData || $firstAccess || $lastCircle) {
				$argsForNewClientData['last_access'] = $firstAccess ? 0 : ($initTime ? $initTime : $lastAccess);
				$clientData = $this->getClientData($clientData, $client, 'history', $argsForNewClientData);
			}
			
			if ($clientData || $firstAccess) {
				$clientsOnlineResult['clients'][$id] = (object)$clientData;
			}
		}
		
		if ($deletion) {
			parent::save();
		}
		s('admin', mt());
		
		return $clientsOnlineResult;
	}
	
	private function getClientData($clientData, $client, $dataName, $args)
	{
		if (isset($client[$dataName])) {
			$args['required_data'] 	= $client[$dataName];
			if (!isset($args['last_access'])) {
				$args['last_access'] = 0;
			}
			
			if (!isset($args['max_items'])) {
				$data = parent::getNewItems($args['required_data'], $args['last_access']);
			} else {
				$data = parent::getNewItems($args['required_data'], $args['last_access'], $args['max_items']);
			}
			
			if ($data) {
				$clientData[$dataName] = $data;
			}
		}
		
		return $clientData;
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
	
	public function getNewData(bool $firstConnect, bool $firstCircle = false, bool $lastCircle = false, $initTime = 0): array
	{
		return $this->read($firstConnect, s('selected_client_id'), isset($_GET['need_data']), $firstCircle, $lastCircle, $initTime);
	}
	
	public function transition()
	{
		return false;
	}
}