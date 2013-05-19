function Database(db3File){
	this.db  = null;
	this.max = 30;
	this.open(db3File);
}

Database.prototype.open = function(db3File) {
	try {
		this.db = openDatabase(db3File, "1.0", "My Database" , 2 * 1024 * 1024 * 1024 *1024);
		return true;
	} catch(ex) {
		debug && console.log(ex);
		return false;
	}
};

Database.prototype.executeS = function(query , success , error , page) {
	this.db.transaction(
	    function (transaction) {
	    	debug && console.log(query);
	        transaction.executeSql(
	        	query ,// + " LIMIT " + (page === undefined ? 0 : page) + "," + this.max + ";",
	        	[],
	        	function(tx , results){
	        		success(tx, results);
	        	},function(tx , err){
	        		console.log(err.message);
	        		if(error !== undefined){
	        			error(err);
	        		}
	        	}
	        )

	    }
	);
};


Database.prototype.execute = function(query , success , error) {
	this.db.transaction(
	    function (transaction) {
	    	debug && console.log(query);
	        transaction.executeSql(
	        	query,
	        	[],
	        	function(tx , results){
	       			success(tx.rows);
	        	},function(tx , err){
	        		debug && console.log(err.message);
	        		if(error !== undefined){
	        			error(err);
	        		}else{
	        			success(null , err);
	        		}
	        	}
	        )

	    }
	);
};
