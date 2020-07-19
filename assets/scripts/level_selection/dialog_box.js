// a script to control dialog box
import global from '../utils/global'

cc.Class({
    extends: cc.Component,

    properties: {
        dialogBox: {
            default: null,
            type: cc.Node,
        },
        label: {
            default: null,
            type: cc.Label,
        },
        stars: {
            default: [],
            type: cc.Sprite,
        },
        confirmLabel: {
            default: null,
            type: cc.Label,
        },
        cancelLabel: {
            default: null,
            type: cc.Label,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        // block touch event
        this.node.width = cc.winSize.width;
        this.node.height = cc.winSize.height;
        this.node.on(cc.Node.EventType.TOUCH_START, (event) => {
            event.stopPropagation();
        });
    },

    pop: function (pos, level, stars) {
        for (let i = 0; i < this.stars.length; ++i) {
            let fill = this.stars[i].node.getChildByName("fill");
            if (stars[i]) {
                fill.active = true;
            } else {
                fill.active = false;
            }
        }
        this.label.string = global.messages.get("LEVEL") + " " + level;
        this.confirmLabel.string = global.messages.get("OK");
        this.cancelLabel.string = global.messages.get("CANCEL");
        // pop out the dialog box
        this.node.position = pos;        
        this.node.active = true;
        let originalScale = this.dialogBox.scale;
        this.dialogBox.scale = 0;
        cc.tween(this.dialogBox).to(0.2, { scale: originalScale }).start();
    },

    disable: function () {
        this.node.active = false;
    },

    confirm: function () {
        this.disable();
        this.node.parent.getComponent("level_selection").startLevel();
    },

    start () {

    },

    // update (dt) {},
});
