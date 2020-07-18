// base menu script
const { inEllipse } = require("../utils/functions");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        // block it to the level node
        this.node.on(cc.Node.EventType.TOUCH_START, (event) => {
            // the menu is in ellipse shape
            let touchPos = this.node.parent.convertToNodeSpaceAR(event.touch.getLocation());
            if (inEllipse(this.node, touchPos)) {
                event.stopPropagation(); 
            }
        });
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
