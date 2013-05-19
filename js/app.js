var debug = document.location.href.indexOf('localhost') >= 0;

function App(){
	$('#loader').show();
	this.db  = null;
	this.bindEvents(this);
	this.initDB();
}

App.run = function(){
	return new App();
}

App.prototype.initDB = function() {
	this.db = new Database('./db/dico.db3');
	var that = this;
	this.db.executeS('SELECT count(*) as nb FROM dico' , function(tx , results){
		debug && console.log(results.rows.item(0)['nb']);
		$('#loader').hide();
	} , function(err){
		that.loadDump(function(){
			$('#loader').hide();
		} , function(prct){
			$('#lblprogress').html(prct);
		});
	});
};

App.prototype.loadDump = function(callback , process , dumpFile) {
	dumpFile = dumpFile === undefined ? 'db/dump.sql' : dumpFile;
	var that = this;
	$('#lblprogress').html('Loading dump...');
	$.get(dumpFile , function(queries){
		$('#lblprogress').html('Start executing queries...');
		query = queries.split('\n');
		that.loadDump_next(query , 0 , callback , process);
	});
};

App.prototype.loadDump_next = function(queries , index , callback , process) {
	var that = this;
	process(index + '/' + queries.length);
	if(index >= query.length){
		callback();
		return;
	}
	this.db.execute(queries[index] , function(){
		that.loadDump_next(queries , ++index , callback , process);
	});
};


App.prototype.bindEvents = function(app) {
	var that = this;
	$('#btnsearch').click(function(){
		app.search();
	});
	$('#mot').keydown(function(evt){
		if(evt.keyCode == 13){
			app.search();
		}
	});
	$('#btnconfig').click(function(){
		if(!navigator.onLine){
			alert('You must be online');
			return false;
		}
		App.showLoader();
		that.db.executeS('SELECT count(*) as nb FROM dico' , function(tx , results){
			$('#db-info').html('Entries in DB : ' + results.rows.item(0)['nb']);
			$.get('./admin/index.php?action=list-dump' , function(dumps){
				dumps = eval('(' + dumps + ')');
				for(var i = 0 ; i < dumps.length ; i++){
					$('<option value="' + dumps[i] + '"> ' + dumps[i] + '</option>').appendTo($('#cmb-dump'));
				}
				$('#frmconfig').modal();
			});
		});
	});
};


App.prototype.loadCustomDump = function(){
	var that = this;
	$('#frmconfig').modal('hide');
	if($('#chkclearbefore').is(':checked')){
		$('#lblprogress').html('Clearing db...');
		this.db.execute('DELETE FROM dico' , function(){
			that._loadCustomDump();
		});
	}else{
		this._loadCustomDump();
	}
}

App.prototype._loadCustomDump = function(){
	$('#lblprogress').html('Loading dump...');
	app.loadDump(function(){
		App.hideLoader();
	} , function(prct){
		$('#lblprogress').html(prct)
	} , 'admin/sql/' + $('#cmb-dump').val());
}

App.showLoader = function(value){
	$('#lblprogress').html(value);
	$('#loader').show();
}
App.hideLoader = function(){
	$('#loader').hide();
}

App.prototype.search = function() {
	$('#loader').show();
	var word = $('#mot').val();
	var whereStatement = " WHERE grec LIKE '" + $('input[name=radsearch]:checked').val().replace('?' , word) + "'"
		+ " OR francais LIKE '" + $('input[name=radsearch]:checked').val().replace('?' , word) + "'"
		+ " OR gr LIKE '" + $('input[name=radsearch]:checked').val().replace('?' , word) + "'"
		+ " OR fr LIKE '" + $('input[name=radsearch]:checked').val().replace('?' , word) + "'";
	var querySelect = 'SELECT * FROM dico' + whereStatement + ' LIMIT 0,30';
    this.db.executeS(querySelect , function(tx, results){
    	debug && console.log(results);
		var tableau = '';
		if(results.rows.length == 0){
			tableau+= '<tr><td colspan="2" style="font-size:50px;color:red;text-align:center;">No result</td></tr>';
		}else {
			for (var i=0; i<results.rows.length; i++) {
				var row = results.rows.item(i);
				tableau+= '<tr><td class="td-data">' + row['grec'] + '</td><td class="td-data">' + row['francais'] + '</td></tr>';
			}
		}
		$('#tableau').html(tableau);
		$('#loader').hide();
    });
};