'use strict';

/**
 * StorageModel:
 * is a library that provides an abstraction/interface ORM(Object Relational Mapper),
 * in order to facilitate the manipulation of data registered in the localstorage.
 *
 * Originally written by: Wellington Eugenio dos Santos
 * license: MIT
 */

/**
 * Collection is "private class". Used internally to handle collections of data
 * @param {Array} items 
 * @param {String} model
 * @return new Instance of Collection 
 */
function Collection(items, model){
	this.model = model;
	this[this.model.toLowerCase()] = items;
};

/**
 * Method used to convert Array to Object json
 * @return Object json 
 */
Collection.prototype.toArray = Collection.prototype.get = function(){
	return this[this.model.toLowerCase()];
};

/**
 * Method get first item
 * @return first item
 */
Collection.prototype.first = function(){
	return this[this.model.toLowerCase()][0];
};

/**
 * Method get set of items
 * @return set of items
 */
Collection.prototype.take = function(n){
	return this[this.model.toLowerCase()].splice(0, n);
};

/**
 * Method for counting items
 * @return number itens
 */
Collection.prototype.count = function(){
	return this[this.model.toLowerCase()].length;
};

/**
 * Method to sort items
 * @param {Object Json} data 
 * @param {String} order
 * @return new Instance of Collection
 */
Collection.prototype.orderBy = function(data, order){
	this[this.model.toLowerCase()].sort(function(a, b){
		return a[data]>b[data];
	});

	if(order && order.toLowerCase() == "dec"){
		return new Collection(this[this.model.toLowerCase()].reverse(), this.model);
	}
	return new Collection(this[this.model.toLowerCase()], this.model);
};

/**
 * Method used to move through items
 * @param {Function} callback 
 * @return callback(item)
 */
Collection.prototype.each = function(callback){
	this[this.model.toLowerCase()].forEach(function(item){
		callback(item);
	});
};

/**
 * Method used to update large amounts of data
 * @param {Object Json} callback 
 * @return {Boolean} true/false
 */
Collection.prototype.update = function(data){
	var keys = Object.keys(data);
	if(keys.length > 0){
		var len = this[this.model.toLowerCase()].length,
			ram = JSON.parse(localStorage.getItem(this.model)) || [],
			ids = [];
		
		this[this.model.toLowerCase()].forEach(function(item){
			ids.push(item.id);
		});
		
		ram.forEach(function(item){
			keys.forEach(function(key){
				if(ids.indexOf(item.id)>-1){
					item[key] = data[key];
				}
			});
		});

		ram = JSON.stringify(ram);
		localStorage.setItem(this.model, ram);

		return true;
	}

	return false;
};

/**
 * Constructor used to instantiate and initialize the entire StorageModel
 * @param {String} model - "Table Name"(If we think of it as a database) 
 * @return new Instance StoraModel
 */
function StorageModel(model){
	this.model = model;
	this.columns = [];
	this.fields = {};

	if(localStorage.getItem(this.model)){
		var ram = JSON.parse(localStorage.getItem(this.model)) || [];

		if(ram.length>0){
			this.columns = Object.keys(ram[0]);
		}
	}
};

/**
 * Method used to create new records
 * @param {Object json} data 
 * @return {Object json} item created
 */
StorageModel.prototype.create = function(data){
	var ram = [],
		id	= 1;

	if(localStorage.getItem(this.model)){
		ram = JSON.parse(localStorage.getItem(this.model));
		
		if(ram != null && ram.length>0){
			id = ram[ram.length-1].id;
			id += 1;
		}
		else{
			id = 1;
		}
	}

	this.fields        = data;
	this.fields.id 	   = id;
	this.fields.status = 1;

	if(ram.length == 0){
		this.columns = Object.keys(this.fields);
	}

	ram.push(this.fields);
	ram = JSON.stringify(ram);
	localStorage.setItem(this.model, ram);

	return this.fields;
};

/**
 * Method used to find item based on feature
 * @param {Object json} data 
 * @return {Object json} Item found
 */
StorageModel.prototype.find = function(data){
	var ram = JSON.parse(localStorage.getItem(this.model)) || [];

	if(typeof data == "number"){
		var self = this;
		ram.forEach(function(item){
			if(item.id == data){
				self.fields = item;
			}
		});
	
		return this.fields;
	}
	else{
		var items = [],
			key   = Object.keys(data)[0];

		if(this.columns.indexOf(key)>-1){
			ram.forEach(function(item){
				if(item[key] ==  data[key] || String(item[key]).indexOf(data[key]) > -1){
					items.push(item);
				}
			});

			return new Collection(items, this.model);
		}
	}
};

/**
 * Method used to update one item exists
 * @param {Object json} data 
 * @param {Number} id 
 * @return {Object json} Item updated
 */
StorageModel.prototype.update = function(data, id){
	var ram = JSON.parse(localStorage.getItem(this.model)) || [];

	if(ram.length>0){
		var keys = Object.keys(data),
			self = this;
		
		ram.forEach(function(item){
			if(item.id == id){
				keys.forEach(function(key){
					item[key] = data[key];
				});
				self.fields = item;
			}
		});
		
		ram = JSON.stringify(ram);
		localStorage.setItem(this.model, ram);

		return self.fields;
	}

	return false;
};

/**
 * The method used to "filter" items
 * @param {Object} Two or three strings - .where('id', 1) or .where('id', '>', 5) 
 * @return {Object json} Item updated
 */
StorageModel.prototype.where = function(){
	var args  = arguments,
		items = [];

	if(args.length == 2){
		var ram  = JSON.parse(localStorage.getItem(this.model)) || [],
			self = this;

		self.fields = {};

		ram.forEach(function(item){
			if(item[args[0]] == args[1]){
				items.push(item);
			}
		});

		return new Collection(items, this.model);
	}
	
	if(args.length == 3){
		var ram   = JSON.parse(localStorage.getItem(this.model)) || [],
			self  = this,
			expression;

		ram.forEach(function(item){
			expression = eval(item[args[0]]+" "+args[1]+" "+args[2]);
			if(expression){
				items.push(item);
			}
		});

		return new Collection(items, this.model);
	}

	return [];
};

/**
 * The method used to get all items
 * @return {Object json} All the itens
 */
StorageModel.prototype.all = function(){
	var ram = JSON.parse(localStorage.getItem(this.model)) || [];
	return new Collection(ram, this.model);
};

/**
 * The method used to counting items
 * @return Number items
 */
StorageModel.prototype.count = function(){
	var ram = JSON.parse(localStorage.getItem(this.model)) || [];
	return ram.length;
};

/**
 * The method used to remove item
 * If the force equals false, it updates the item status to 0. If it is true remove item
 * @param {Number} id
 * @param {Boolean} force
 * @return {Boolean} true/false
 */
StorageModel.prototype.remove = function(id, force){
	if(localStorage.getItem(this.model)){
		var ram = JSON.parse(localStorage.getItem(this.model)) || [],
			idx = 0;
		
		ram.forEach(function(item){
			if(item.id == id)
				idx = ram.indexOf(item);
		});

		if(force){
			if(force == true || force.toLowerCase() == 'f')
				ram.splice(idx, 1);
		}
		else{
			ram[idx].status = 0;
		}

		ram = JSON.stringify(ram);
		localStorage.setItem(this.model, ram);	
	
		return true;
	}

	return false;
};

/**
 * The method used to drop model(clear table)
 * @return {Boolean} true/false
 */
StorageModel.prototype.dropModel = function(){
	if(localStorage.getItem(this.model)){
		localStorage.setItem(this.model, []);
		return true;
	}

	return false;
};

/**
 * The method used to drop all(clear localstorage)
 * @return {Boolean} true
 */
StorageModel.prototype.drop = function(){
	localStorage.clear();
	return true;
};