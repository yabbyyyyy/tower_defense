// a script to control dialog box

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

    onLoad () {
        // block touch event
        this.node.width = cc.winSize.width;
        this.node.height = cc.winSize.height;
        this.node.on(cc.Node.EventType.TOUCH_START, (event) => {
            event.stopPropagation();
        });
    },

    pop (pos = cc.v2.zero) {
        this.node.position = pos;
        this.node.active = true;
        let originalScale = this.dialogBox.scale;
        this.dialogBox.scale = 0;
        cc.tween(this.dialogBox).to(0.2, { scale: originalScale }).start();
    },

    disable() {
        this.node.active = false;
    },

    start () {

    },

    // update (dt) {},
});
