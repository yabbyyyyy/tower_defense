// script to control the level selection scene
import global from '../utils/global'

var mySaveData = {
    "1": [1, 1, 0],
    "2": [0, 0, 0],
}

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
        for (let i = 0; i < this.levels.length; ++i) {
            this.levels[i].lid = i + 1;
            this.levels[i].controller = this;
            this.levels[i].getComponent("level_button").setEnabled(true);
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

    selectLevel: function (level) {
        global.currLevel = level;
        this.dialogBox.getComponent("dialog_box").pop(this.camera.node.position, level, mySaveData[level]);
    },

    startLevel: function () {
        cc.director.loadScene("game_stage", (err, scene) => {
            if (err) { cc.log(err); return; }
             cc.director.runScene(scene);
        });
    },

    start () {

    },

    update (dt) {

    },
});
