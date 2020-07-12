// game world script

cc.Class({
    extends: cc.Component,

    properties: {
		gameLayerNode: {
			default: null,
			type: cc.Node,
		},
		
		gameUINode: {
			default: null,
			type: cc.Node,
		},
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
		cc.assetManager.downloader.register('.spr', (url, options, callback) => {
			var reader = require("sprite_reader");
			var myData = reader.readFile(url);
			callback(null, myData);
	   });
		cc.assetManager.parser.register('.spr', function (file, options, callback) {
			var reader = require("sprite_reader");
			var res = reader.parseData(file);
			callback(null, res);
		});
		// var file_path = String.raw`E:\GameProjects\wx_td2\assets\resources\sprite\wolf`;
		cc.resources.load('sprite/wolf', (err, result) => {
			if (err) {
				cc.log("loader error: " + err);
			} else {
				cc.log('call back here');
				cc.log(result);
			}
		});
	},

    start () {

    },

    // update (dt) {},
});
