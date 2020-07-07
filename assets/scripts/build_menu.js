// build menu script
import global from './global'

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
		
	},

	buttonClick:function (event, customData) {
		// cc.log("clicked " + customData);
		global.event.trigger("build_tower", customData);
	},
	
    start () {

    },

    // update (dt) {},
});
