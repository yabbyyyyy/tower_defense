// build menu script

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        // block it to the level node
        this.node.on(cc.Node.EventType.TOUCH_START, (event) => {
            // the menu is in ellipse shape
            let canvas = cc.director.getScene().getChildByName('Canvas');
            let diff = event.touch.getLocation()
                       .sub(cc.v2(canvas.width/2., canvas.height/2.))
                       .sub(this.node.position);
            let a = this.node.width/2.*this.node.scale;
            let b = this.node.height/2.*this.node.scale;
            if (diff.x*diff.x/a/a + diff.y*diff.y/b/b < 1.) {
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
