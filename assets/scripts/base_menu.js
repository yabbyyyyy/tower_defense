// build menu script

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {

	},

    // the functionality depends on the customData and tower's id
	buttonClick: function (event, customData) {
        // cc.log("clicked " + customData);
        event.stopPropagation();
        this.node.target.buildTower(customData);
        this.node.controller.closeMenu();
	},
	
    start () {

    },

    // update (dt) {},
});
