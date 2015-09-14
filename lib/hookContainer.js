//@module blueHTML

'use strict';

//@class HookContainer
module.exports = (function ()
{
	//@method HookContainer
	//@constructor
	//@return {Void}
	function HookContainer ()
	{
		this.hooks = [];
	}

	//@method add Adds a hook into the current hook container
	//@param {Hook} hook
	//@return {Void}
	HookContainer.prototype.add = function (hook)
	{
		this.hooks.push(hook);
	};

	//@method execute Execute all register hooks
	//@param {Any} xx This method allows an arbitrary number of parameters. Only the first only will be accumulated among all hooks and returned
	//@return {Any} First parameter passed in
	HookContainer.prototype.execute = function ()
	{
		var args = Array.prototype.slice.call(arguments, 0);

		for (var i = 0; i < this.hooks.length; i++)
		{
			args[0] = this.hooks[i].execute.apply(this.hooks[i], args) || args[0];
		}

		return args[0];
	};

	return HookContainer;
})();

//@class Hook
//@method execute Execute the plugin itself
//@param {Any} This method allows a variable numbers of parameters. This will depend on the invocation of the HookContainer
//@return {Any} The returned value, if any, will be accumulated during the execution of all plugins
//
//@property {String} name
//@property {Number} priority
