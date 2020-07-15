// build menu script

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
		
	},

	buttonClick: function (event, customData) {
		// cc.log("clicked " + customData);
        this.node.target.buildTower(customData);
        this.node.controller.closeMenu();
	},
	
    start () {

    },

    // update (dt) {},
});
