class Advisor extends Messenger
{
	constructor()
	{
		super('admin');
		
		this.listenTimeout		= 2000;
		this.durationTimer 		= false,
		this.needData			= false,
		this.titleToggleTimer	= false,
		this.isTransition		= false,
		this.activeClientId		= window.clientId;
		this.clients 			= {};
	}
	
	generateListenData()
	{
		let data = {};
		
		if (this.firstAccess) {
			data.first_connect = '';
		}
		
		if (this.activeClientId) {
			data.client_id = this.activeClientId;
		}
		
		return data;
	}
	
	listenCallback(responce){
		if (!this.handleResponce(responce)) {
			return false;
		}
			
		if (responce.clients) {
			for (let client in responce.clients) {
				let 
					selectedClient 	= this.activeClientId == client,
					clnt 			= responce.clients[client];
				
				clnt.id = client;
				
				this.updateClient(clnt, selectedClient);
				
				if (selectedClient) {
					this.handleClient(this.isTransition ? this.clients[client] : clnt);
				}
			}
		} else {
			this.handleClient(false);
		}
		
		return true;
	}
	
	send()
	{
		$('#idialog-message').focus();
		let sendData = {
			message: 	$('#idialog-message').val(),
			client_id: 	this.activeClientId
		};
		
		this.addMessage(sendData);
	}
	
	getActiveClient(){
		return this.activeClientId ? this.clients[this.activeClientId] : false;
	}
	
	

	handleClient(client){
		if (client === false) {
			if (this.isTransition) {
				client = this.getActiveClient()
			} else {
				return;
			}
		}
		
		this.setSelectedClientInfo(client);
		if(isset('messages', client)) {
			this.showMessages(client.messages);
		}
	}
	
	showMessages(messages){
		messages.forEach((message) => {
			this.showMessage(message.message, message.ts, message.from);
		});
		scrollMessageBlock('#idialog-messages');
		
		if (!this.firstAccess && messages[messages.length - 1].from == 'client') {
			if (!document.hasFocus()) {
				this.play();
				//titleToggle();
			}
		}
	}
	
	updateClient(client, selectedClient){
		let 
			dialog_clients 	= '#idialog-clients',
			$clientBlock 	= $('#idialog-clients [data-id="'+client.id+'"]'),
			newClient 		= isUndefined(this.clients[client.id]),
			lastMSg;
		
		//if (newClient || (selectedClient && this.needData)) {
		if (newClient) {
			this.clients[client.id] = client;
		} else {
			for (let prop in client) {
				if (!isUndefined(this.clients[client.id][prop])) {
					if (Array.isArray(client[prop])) {
						this.clients[client.id][prop] = this.clients[client.id][prop].concat(client[prop]);
					} else if (this.clients[client.id][prop] != client[prop]) {
						this.clients[client.id][prop] = client[prop];
					}
				} else {
					this.clients[client.id][prop] = client[prop];
				}
			}
		}
		
		if (newClient) {
			let newClientItem = this.getNewClientItem(client.id);
			let append = $(dialog_clients + ' > ul > li').length;
			$(dialog_clients + ' > ul')[append ? 'append' : 'html'](newClientItem);
			$clientBlock = $(dialog_clients + ' > ul > li[data-id="'+client.id+'"]');
		}
		
		if (isset('messages', client)) {
			lastMSg = client.messages[client.messages.length - 1];
		} else if(newClient) {
			lastMSg = {
				ts: false,
				from: 'advisor',
				message: 'Здравствуйте, могу ли я Вам чем-то помочь?'
			};
		}
		
		if (!isUndefined(lastMSg)) {
			$clientBlock.find('.idialog-lastmsg-time').text(lastMSg.ts ? date(lastMSg.ts) : '-');
			$clientBlock.find('.idialog-msg').text((lastMSg.from == 'advisor' ? 'я: ' : '') + lastMSg.message);
		}
	}
	
	getNewClientItem(clientId)
	{
		return `
			<li class="dlg" title="Перейти к диалогу с Клиент `+clientId+`" data-id="`+clientId+`">
			
				<div class="idialog-avatar">`+clientId+`</div>
				<div class="idialog-msg-wrapper">
					<div class="col-md-8 idialog-client-name">Клиент `+clientId+`</div>
					<div class="col-md-4 right idialog-lastmsg-time"></div>
					<div class="idialog-msg"></div>
				</div>
			</li>
		`;
	}
	
	setHistory(history){
		if (!history) return;
		let 
			s 		= '',
			count 	= history.length,
			last	= history[count - 1];
		
		history.reverse().forEach(function(item){
			s += `<li><span>`+(count--)+`)`+date(item.ts)+`</span> <a href="`+item.url+`" target="_blank">`+item.title+`</a></li>`;
		});
		
		$('#dlg-client-history-caption #dlg-h-time').text(date(last.ts));
		$('#dlg-client-history-caption > a').attr({'href': last.url}).text(last.title);
		$('#dlg-client-history-caption #dlg-h-count').text('( '+this.getActiveClient()['history'].length+' )');
		$('#idialog-client-history ul').prepend(s);
	}
	
	setClientInfo(client){
		if(!isset('geo', client) || !isset('history', client)) {
			return; 
		}
		
		let 
			date 		= new Date(),
			minOnSite 	= Math.floor((date.getTime() / 1000 - client.history[0].ts) / 60);
		
		$('#idialog-client-info .idialog-avatar').text(client.id);
		$('#idialog-client-info-name').text('Клиент ' + client.id);
		$('#idialog-client-info-referer').html(client.referer);
		$('#idialog-client-info-stats').text('На сайте ' + minOnSite + ' мин., просмотрено страниц ' + client.history.length);
		$('#idialog-client-info-geo').text(client.geo + ', IP адрес ' + client.ip);
		this.minOnSiteCounter();
	}
	
	setSelectedClientInfo(client){
		let cl;
		
		if (this.isTransition || this.firstAccess) {console.log(1);
			$('#idialog-messages, #idialog-client-history ul').html('');
			$('#idialog-messages-wrapper, #idialog-client-info').removeClass('none');
			cl = this.getActiveClient();
			this.setClientInfo(cl);
		} else {
			cl = client;
		}
		console.log(cl);
		this.setHistory(cl.history);
	}
	
	minOnSiteCounter(){
		clearInterval(this.durationTimer);
		let $stats = $('#idialog-client-info-stats');
		if ($stats.length) {
			let minOnSite = +$stats.text().match(/(\d+) мин/)[1];
			this.durationTimer = setInterval(function(){
				$stats.text($stats.text().replace(/(\d+) мин/, (minOnSite += 1) + ' мин'));
			}, 60 * 1000);
		}
	}
	
	selectClient(el)
	{
		let 
			clientId = $(el).data('id'),
			data = {};
		
		if (clientId == this.activeClientId) {
			return;
		}
		
		this.activeClientId = clientId;
		
		if (isUndefined(this.clients[clientId]['geo'])) {
			data.need_data = '';
			this.needData = true;
		} else {
			this.needData = false;
		}
		
		this.go('?client_id=' + clientId, data);
	}
	
	go(href, data = false, replace = false){
		// let 
			// load 			= false,
			// toggleLoadFlag 	= false;
			
		// load = setTimeout(function(){
			// toggleLoadFlag = true;
			// toggleLoad();
		// }, 500);
		
		this.isTransition = true;
		
		$.getJSON(href, data ? data : {}).always((responce) => 
		{
			//console.log(responce);
			history[replace ? 'replaceState' : 'pushState'](null, null, href);
			//clearTimeout(load);
			// if (toggleLoadFlag && responce.statusText != 'error') toggleLoad();
			this.listenCallback(responce);	
			this.isTransition = false;
		});
	}
}

;(function(){
	$(function(){
		let advisor = new Advisor;
		window.advisor = advisor;
		advisor.listen();
		
		$('#idialog-clients').on('click', 'li', function() {advisor.selectClient(this)});
		
		$('#idialog-send').click(() => advisor.send());
		
		scrollMessageBlock('#idialog-messages');
		
		resize();
		var resizeListen = fnOnTimeout(resize, 300);
		$(window).resize(function(){
			resizeListen();
		});
		
		$('#mobile-nav').click(function(){
			$('#idialog-clients').toggleClass('open');
		});
		
		let hideHistoryTimer;
		$('#dlg-history-list').hover(
			function(e){
				clearTimeout(hideHistoryTimer);
				$('#dlg-history-list > div').fadeIn();
				//$('#dlg-history-list')[e.target.id != 'idialog-show-history' ? 'hide' : 'toggle']();
			},
			function(e){
				hideHistoryTimer = setTimeout(() => $('#dlg-history-list > div').fadeOut(), 500);
			}
		);
		
		
		// let docFocusAction = fnOnTimeout(function(){
			// if (titleToggleTimer) {
				// clearInterval(titleToggleTimer);
				// titleToggleTimer = false;
			// }
		// });
		
		// переделать. сделать иконку истории вместо стрелки и показывать при наведении, закрывать при отведении когда пройдет 1 сек
		//$(document).on('click hover mousemove focus', docFocusAction);
		
		window.onpopstate = function(event) {
			advisor.go(document.location.href, false, true);
		};
		
	});
	
	
	
	function resize(){
		var $dlgMsgWrp = $('#idialog-messages-wrapper');
		if (!$dlgMsgWrp.length) return;
		var wh = $(window).height();
		$dlgMsgWrp.css('height', wh - $dlgMsgWrp.offset().top);
	}
	
	// function titleToggle(){
		// let 
			// title = $('title').text();
			// flag = false;
		// titleToggleTimer = setInterval(function(){
			// $('title').text(flag  ? title : '*** Новое сообщение');
			// flag = !flag;
		// }, 2000);
	// }
	
	
	// without reload
	
})();