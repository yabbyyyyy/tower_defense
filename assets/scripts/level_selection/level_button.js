// level selection button script

const numberColors = ["#3C0047", "#474747"];

cc.Class({
    extends: cc.Component,

    properties: {
        emblem: {
            default: null,
            type: cc.Sprite,
        },
        number: {
            default: null,
            type: cc.Label,
        },
        stars: {
            default: [],
            type: cc.Sprite,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    // the functionality depends on the customData and tower's id
	buttonClick: function (event, customData) {
        event.stopPropagation();
        if (this.node.controller) {
            this.node.controller.selectLevel(this.node.lid);
        }
	},

    setEnabled: function (enable) {
        if (!enable) {
            this.number.node.color = this.number.node.color.fromHEX(numberColors[1]);
            for (let star of this.stars) {
                star.setMaterial(0, cc.MaterialVariant.createWithBuiltin(cc.Material.BUILTIN_NAME.GRAY_SPRITE));
            }
            this.node.getComponent(cc.Button).interactable = false;
        } else {
            this.node.getComponent(cc.Button).interactable = true;
            this.number.node.color = this.number.node.color.fromHEX(numberColors[0]);
            for (let star of this.stars) {
                star.setMaterial(0, cc.MaterialVariant.createWithBuiltin(cc.Material.BUILTIN_NAME.SPRITE));
            }
        }

    },

    start () {

    },

    // update (dt) {},
});
