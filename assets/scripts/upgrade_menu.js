// upgrade menu
import global from './global'

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
	
	buttonClick: function (event, customData) {
		switch (customData) {
		case "sell":
			global.event.trigger("sell_tower");
			break;
		case "upgrade":
			global.event.trigger("upgrade_tower");
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
