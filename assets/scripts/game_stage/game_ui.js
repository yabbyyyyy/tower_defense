// ui script

import global from './global'

cc.Class({
    extends: cc.Component,

    properties: {
		countDownLabel: {
			default: null,
			type: cc.Label,
		},
		damageLabel: {
			default: null,
			type: cc.Prefab,
		},
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
		global.battle.ui = this;
		this.now = 3;
	},

	update: function (dt) {
		if (this.now >= dt) {
			this.now -= dt;
			if (this.now - Math.floor(this.now) < dt) {
				// cc.log(this.now);
				this.countDownLabel.string = Math.floor(this.now);
				if (this.now < dt) {
					this.countDownLabel.string = "Start!";
					// cc.log("start");
					global.event.trigger("level_start");
					cc.tween(this.countDownLabel.node).to(3.0, {opacity: 0}).start();
				}
			}
		}
	},

	showResources: function (res) {
		for (let i = 0; i < this.resourceLabels.length; ++i) {
			this.resourceLabels[0].getComponent(cc.Label).string = res[i];
		}
	},

	popDamage: function (damage, position, duration = 1.0, crit=false, moveBy = cc.v3(80, 80, 0)) {
		let label = cc.instantiate(this.damageLabel);
		label.zIndex = 10;
		label.position = position;

		let labelScript = label.getComponent(cc.Label);
		
		if (crit) {
			labelScript.string = damage + "!";
			label.color = new cc.Color(255, 255, 0);
			labelScript.fontSize = 50;
			labelScript.lineHeight = 50;
		} else {
			labelScript.string = damage;
			labelScript.fontSize = 40;
			labelScript.lineHeight = 40;
		}

		label.parent = this.node;
		cc.tween(label)
		.by(duration, {opacity: -label.opacity, position: moveBy})
		.call(label.destroy.bind(label))
		.start();
	},

    start () {

    },
});
