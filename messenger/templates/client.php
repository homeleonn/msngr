	<link rel="stylesheet" href="<?=msngrUri()?>assets/css/send-client.css">
	<link rel="stylesheet" href="<?=msngrUri()?>messenger/assets/css/style.css">
	<div id="idialog">
		<button id="idialog-close" class="icon-msngr-cancel-1"></button>
		<button id="idialog-mute" class="icon-msngr-volume-up-1"></button>
		<div id="idialog-header" class="idialog-p">
			<div id="idial-avatar">
				<!--<span class="icon-msngr-thumbs-down"></span>-->
				<img src="<?=msngrUri()?>messenger/assets/img/avatar.jpg">
				<!--<span class="icon-msngr-thumbs-up"></span>-->
			</div>
			<div id="idial-name">Ксения Юшкевич</div>
			<span>(консультант)</span>
		</div>
		<div id="idialog-static-title">Если есть вопросы, Вы можете задать их здесь.</div>
		<div id="idialog-content">
			<div id="idialog-messages">
				<div class="idialog-advisor">
					<div class="idialog-message-content">
						Здравствуйте, могу ли я Вам чем-то помочь?
					</div>
				</div>
			</div>
			<div id="send-block">
				<input type="text" id="idialog-message" name="idialog-message" placeholder="Введите Ваше сообщение">
				<span id="idialog-send" class="icon-msngr-paper-plane"></span>
			</div>
		</div>
	</div>
	<div id="idialog-init">
		<img src="<?=msngrUri()?>messenger/assets/img/chat-init.png">
		<img src="<?=msngrUri()?>messenger/assets/img/avatar.jpg" id="idialog-init-avatar">
		<div id="idialog-init-title">Консультант сейчас онлайн.<br>Задайте интересующий Вас вопрос.</div>
	</div>
	<!--
	<div id="phone-num">
		<input type="text" placeholder="(___) ___-__-__" value="">
	</div>
	-->
	<script>
		var messengerRoot 	= '<?=msngrUri()?>';
		
		if (!window.jQuery) {
			msngrLoadJS('<?=msngrUri()?>assets/js/jq3.js')
		}
		
		function msngrLoadJS(url)
		{
		   var xhrObj = new XMLHttpRequest();
			// open and send a synchronous request
			xhrObj.open('GET', url, false);
			xhrObj.send('');
			// add the returned content to a newly created script tag
			var se = document.createElement('script');
			se.type = "text/javascript";
			se.text = xhrObj.responseText;
			document.getElementsByTagName('head')[0].appendChild(se);
		}
	</script>
	<script src='<?=msngrUri()?>messenger/assets/js/common.js'></script>
	<script src='<?=msngrUri()?>messenger/assets/js/client.js'></script>
