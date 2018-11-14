<?php
include __DIR__ . '/header.php';
if (is_null(s('admin'))) {
	// Удалим себя, как пользователя, если заходили под таковым
	// if (!is_null(s('cId'))) {
		// $messenger = new messenger\Messenger;
		// $messenger->removeClientOnId(s('cId'));
		// $messenger->save();
		// unset($messenger);
	// }
	s('admin', 1);
}
$clients = (new messenger\AdvisorMessenger)->read();
s('admin', microtime(true));
$clientId = $_GET['client'] ?? NULL;

?>
<span id="mobile-nav"></span>
<div id="idialog-admin">
	<div id="idialog-clients" class="col-sm-3">
		<h3>Клиенты</h3>
		<ul>
			<?php 
			if (!$clients) : 
				echo 'Клиентов пока что нет.'; 
			else : 
				foreach ($clients as $id => $client) :
					if (isset($client['messages'])) {
						$msg = arrayLast($client['messages']);
						$message = ($msg['from'] == 'advisor' ? 'я: ':'') . substr($msg['message'], 0, 50);
						$time = $msg['time'];
					} else {
						$message = 'Здравствуйте, могу ли я Вам чем-то помочь?';
						$time = arrayLast($client['transitions'])['time'];
					}
					
					$time = date('H:i', $time);
			?>
			<li title="Перейти к диалогу с Клиент <?=$id?>" data-id="<?=$id?>">
				<div class="idialog-avatar"><?=$id?></div>
				<div class="idialog-msg-wrapper">
					<div class="col-md-8 idialog-client-name">Клиент <?=$id?></div>
					<div class="col-md-4 right idialog-lastmsg-time"><?=$time?></div>
					<div class="idialog-msg"><?=$message?></div>
				</div>
			</li>
			<?php 
					
				endforeach;
			endif;
			?>
		</ul>
	</div>
	<?php
	if ($clientId && is_numeric($clientId) && isset($clients[$clientId])):
		$client = $clients[$clientId];
		$historyLast = arrayLast($client['transitions']);
		$transitionCount = count($client['transitions']);
	?>
	<div id="idialog-messages-wrapper" class="col-sm-7">
		<!--<div id="idialog-exit">Выйти из диалога</div>-->
		<div id="idialog-client-history">
			<?=date('H:i', $historyLast['time'])?> 
			<a href="<?=$historyLast['url']?>"><?=$historyLast['title']?></a> 
			(<?=$transitionCount?>) 
			<button id="idialog-show-history" class="b" onclick="">&#8744;</button>
			<div>
				<ul>
					<?php foreach (array_reverse($client['transitions']) as $t) :?>
					<li><span><?=($transitionCount--) . ')' . date('H:i', $t['time'])?></span> <a href="<?=$t['url']?>"><?=$t['title']?></a></li>
					<?php endforeach;?>
				</ul>
			</div>
		</div>
		<div id="idialog-messages" class="mt20" data-id="<?=$clientId?>">
			<?php 
			if (isset($client['messages'])) :
				foreach ($client['messages'] as $msg) :
				?>
				<div class="idialog-<?=$msg['from']?>">
					<div class="idialog-message-content">
						<div class="idialog-message-time"><?=date('H:i', $msg['time'])?></div>
						<?=$msg['message']?>
					</div>
				</div>
				<?php
				endforeach;
			endif;?>
		</div>
		<div id="send-block">
			<input type="text" id="idialog-message" name="idialog-message" placeholder="Введите Ваше сообщение">
			<span id="idialog-send" class="icon-paper-plane"></span>
		</div>
	</div>
	<div id="idialog-client-info" class="col-sm-2">
		<div class="center mb20">
			<div class="idialog-avatar"><?=$clientId?></div>
			<div id="idialog-client-info-name">Клиент <?=$clientId?></div>
		</div>
		<hr class="mb20">
		<ul>
			<li id="idialog-client-info-referer"><?=$client['referer']?></li>
			<li id="idialog-client-info-stats">На сайте <?=floor((time() - $client['transitions'][0]['time']) / 60)?> мин., просмотрено страниц <?=count($client['transitions'])?></li>
			<li id="idialog-client-info-geo"><?=$client['geo'].', IP адрес '.$client['ip']?></li>
		</ul>
	</div>
	<?php endif;?>
</div>
<script>
	var clientId = '<?=($clientId ?: 'undefined')?>';
</script>
<?php include __DIR__ . '/footer.php'; global $start; echo '<!--', microtime(true) - $start, '-->'?>