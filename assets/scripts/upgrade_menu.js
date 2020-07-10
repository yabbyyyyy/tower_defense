// upgrade menu

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
	
	buttonClick: function (event, customData) {
		switch (customData) {
		case "sell":
			this.node.target.sellTower();
			break;
		case "upgrade":
			this.node.target.upgradeTower();
			break;
		default:
			cc.log("Unknown upgrade menu data << " + customData);
			break;
		}		
	},

    start () {

    },

    // update (dt) {},
});
