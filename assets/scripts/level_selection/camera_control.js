// camera script to control level selection scene

function clamp (num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}

cc.Class({
    extends: cc.Component,

    properties: {
        worldMap: {
            default: null,
            type: cc.Sprite,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        // main camera size
        this.mapWidth = this.worldMap.node.width;
        this.mapHeight = this.worldMap.node.height;
        this.camera = this.node.getComponent(cc.Camera);
        this.camera.zoomRatio = 1.5;
    },

    drag: function (event) {
        let delta = event.getDelta();
        //Get the information of the last point from the mouse
        this.node.position = this.node.position.add(delta.mul(-1));
        let scale = this.camera.zoomRatio;

        // possible range
        let xmax = (this.mapWidth - cc.winSize.width/scale)/2.;
        let ymax = (this.mapHeight - cc.winSize.height/scale)/2.;

        let dragPos = this.node.position.add(delta.mul(-1));
        this.node.position = cc.v2(clamp(dragPos.x, -xmax, xmax), clamp(dragPos.y, -ymax, ymax));
    },

    start () {

    },

    // update (dt) {},
});
