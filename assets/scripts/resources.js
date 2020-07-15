// script to manage resources
import global from './global'

cc.Class({
    extends: cc.Component,

    properties: {
        gameUI: {
            default: null,
            type: cc.Node,
        },
        resLabels: {
            default: [],
            type: cc.Label,
        },
        popLabels: {
            default: [],
			type: cc.Prefab,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        global.battle.resources = this;
        this.resources = [0, 0];
        this.resourcesRes = [0., 0.];
    },

    add: function (res, pop=false, pos=cc.v2.zero) {
        cc.log("called");
        let increment = [];
        for (let i = 0; i < this.resources.length; ++i) {
            this.resourcesRes[i] += res[i];
            increment.push(Math.floor(this.resourcesRes[i]) - this.resources[i]);
            this.resources[i] += increment[i];
        }
        if (pop) {
            this.popResources(increment, pos);
        }
    },

    start () {

    },

	popResources: function (incre, position, duration=3.0, moveBy=cc.v3(0, 300, 0)) {
        let showed = 0;
		for (let i = 0; i < incre.length; ++i) {
            let num = Math.floor(incre[i]);
            if (num == 0) { continue; }
            
			let label = cc.instantiate(this.popLabels[i]);
			label.zIndex = 99;
			label.position = position.add(cc.v2(15*showed, -15*showed));

			let labelScript = label.getComponent(cc.Label);		
			labelScript.string = (num > 0 ? "+" : "-") + Math.abs(num);
			let icon = label.getChildByName("icon");
			icon.position.x = -((label.width + icon.width)/2. + 2);

			label.parent = this.gameUI;
			cc.tween(label)
			.by(duration, {opacity: -label.opacity, position: moveBy})
			.call(label.destroy.bind(label))
            .start();
            showed ++;
		}
	},

    update: function (dt) {
        for (let i = 0; i < this.resLabels.length; ++i) {
            this.resLabels[i].string = this.resources[i];
        }
    },
});
