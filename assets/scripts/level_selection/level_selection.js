// script to control the level selection scene
import global from '../utils/global'

cc.Class({
    extends: cc.Component,

    properties: {
        dialogBox: {
            default: null,
            type: cc.Node,
        },
        camera: {
            default: null,
            type: cc.Camera,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        // size and script
        this.cameraControl = this.camera.getComponent("camera_control");
        this.camera.zoomRatio = 2.0;
        let canvas = cc.find("Canvas");
        this.node.width = canvas.width;
        this.node.height = canvas.height;

        // level buttions
        this.levels = this.node.getChildByName("levels").getChildren();
        for (let level of this.levels) {
            level.controller = this;
            level.getComponent("level_button").setEnabled(true);
        }
        
        // camera events
        this.onTouch = false;
        //Record mouse click status when user clicks
        this.node.on(cc.Node.EventType.TOUCH_START, (event)=>{
            this.onTouch = true;
        });
        //Drag and drop only when the user presses the mouse
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event)=>{
            if (this.onTouch) {
                this.cameraControl.drag(event);
            }
        });
        //Restore state when mouse is raised
        this.node.on(cc.Node.EventType.TOUCH_END, (event)=>{
            this.onTouch = false;
        });

        // TODO put it on the start
        global.messages.load("configs/messages");
    },

    selectLevel: function (customData) {
        this.dialogBox.getComponent("dialog_box").pop(this.camera.node.position);
    },

    start () {

    },

    update (dt) {

    },
});
