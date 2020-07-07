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

	},

    start () {

    },

    // update (dt) {},
});
