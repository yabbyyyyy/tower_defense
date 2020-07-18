// script to control the level selection scene

cc.Class({
    extends: cc.Component,

    properties: {
        camera: {
            default: null,
            type: cc.Camera,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // size and script
        this.cameraControl = this.camera.getComponent("camera_control");
        let canvas = cc.find("Canvas");
        this.node.width = canvas.width;
        this.node.height = canvas.height;

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
    },

    start () {

    },

    // update (dt) {},
});
