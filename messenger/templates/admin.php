<?php
use messenger\{AdvisorMessenger, Listener};
// save selected client id
s('selected_client_id', $_GET['client_id'] ?? null);
if (isAjax()) {
	if (!isset($_GET['client_id'])) exit;
	if ($responce = (new AdvisorMessenger)->getNewData(false)) {
		s('admin', mt());
		Listener::json($responce);
	}
	exit;
}
include __DIR__ . '/header.php';
?>
<div id="load" class="none"></div>
<span id="mobile-nav"></span>
<div id="idialog-admin">
	<div id="idialog-clients" class="col-sm-3">
		<h3>Клиенты</h3>
		<ul></ul>
	</div>
	<div id="idialog-messages-wrapper" class="col-sm-7 none">
		<div id="idialog-client-history">
			<span id="dlg-client-history-caption">
				<span id="dlg-h-time"></span>
				<a href="#" target="_blank"></a> 
				<span id="dlg-h-count"></span>
			</span>
			<div id="dlg-history-list">
				<button id="idialog-show-history" class="b icon-history"></button>
				<div><ul></ul></div>
			</div>
			
		</div>
		<div id="idialog-messages" class="mt20" data-id=""></div>
		<div id="send-block">
			<input type="text" id="idialog-message" name="idialog-message" placeholder="Введите Ваше сообщение">
			<span id="idialog-send" class="icon-paper-plane"></span>
		</div>
	</div>
	<div id="idialog-client-info" class="col-sm-2 none">
		<div class="center mb20">
			<div class="idialog-avatar"></div>
			<div id="idialog-client-info-name"></div>
		</div>
		<hr class="mb20">
		<ul>
			<li id="idialog-client-info-referer"></li>
			<li id="idialog-client-info-stats"></li>
			<li id="idialog-client-info-geo"></li>
		</ul>
	</div>
</div>

<div id="dlg-prototypes" class="none">
	<li title="" data-id="" id="dlg-client-proto">
		<div class="idialog-avatar"></div>
		<div class="idialog-msg-wrapper">
			<div class="col-md-8 idialog-client-name"></div>
			<div class="col-md-4 right idialog-lastmsg-time"></div>
			<div class="idialog-msg"></div>
		</div>
	</li>
	<li id="dlg-history-item-proto"><span></span> <a href="#"></a></li>
	<div class="idialog-" id="dlg-message-proto">
		<div class="idialog-message-content">
			<div class="idialog-message-time"></div>
		</div>
	</div>
</div>
<script>
	var clientId = <?=($_GET['client_id'] ?? 'false')?>;
</script>
<?php 
include __DIR__ . '/footer.php'; 
global $start; 
echo '<!--', mt() - $start, '-->';
?>