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
		global.battle.uiLayer = this;
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
				}
			}
		}
	},

	showDamage: function (damage, position, duration=1.0, crit=false) {
		let label = cc.instantiate(this.damageLabel);
		label.zIndex = 10;
		label.position = position;

		let labelScript = label.getComponent(cc.Label);
		
		if (crit) {
			labelScript.string = damage + "!";
			label.color = new cc.Color(255, 215, 0);
			labelScript.fontSize = 50;
			labelScript.lineHeight = 50;
		} else {
			labelScript.string = damage;
			labelScript.fontSize = 40;
			labelScript.lineHeight = 40;
		}


		label.parent = this.node;
		let action = cc.spawn(cc.fadeOut(duration), cc.moveBy(duration, cc.v2(0, 50)));
		label.runAction(cc.sequence(action, cc.callFunc(label.destroy, label)));
	},

    start () {

    },
});
