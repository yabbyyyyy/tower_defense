// upgrade menu

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // block it to the level node
        this.node.on(cc.Node.EventType.TOUCH_START, (event) => {
            // the menu is in ellipse shape
            let touchPos = this.node.parent.convertToNodeSpaceAR(event.touch.getLocation());
            let diff = touchPos.sub(this.node.position);
            let a = this.node.width/2.*this.node.scale;
            let b = this.node.height/2.*this.node.scale;
            if (diff.x*diff.x/a/a + diff.y*diff.y/b/b < 1.) {
                event.stopPropagation(); 
            }
        });
	},
	
	buttonClick: function (event, customData) {
		// cc.log(customData);
		event.stopPropagation();
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
		this.node.controller.closeMenu();
	},

    start () {

    },

    // update (dt) {},
});
