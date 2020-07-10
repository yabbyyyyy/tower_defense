const EventListener = function (obj) {
	let Register = {};
	obj.register = function (name, method) {
		if (!Register.hasOwnProperty(name)) {
			Register[name] = [];
		}
		
		Register[name].push(method);
	};
	
	obj.trigger = function (name) {
		if (Register.hasOwnProperty(name)) {
			for (var method of Register[name]) {
				// arguments is the list of all input arguments, the first one is explicitly used as name here
				let args = Array.prototype.slice.call(arguments, 1);
				// apply method with arguments
				method.apply(this, args);
			}
		}
	};
	
	obj.remove = function (name, method) {
		if (Register.hasOwnProperty(name)) {
			let methodList = Register[name];
			for (let i = 0; i < methodList.length; i++) {
				if (methodList[i] == method) {
					methodList.splice(i, 1);
					i--;
				}
			}
		}
	};
	
	obj.off = function (name) {
		delete obj[name];
	};
	
	obj.clear = function () {
		Register = {};
	};
	
	return obj;
}

export default EventListener;