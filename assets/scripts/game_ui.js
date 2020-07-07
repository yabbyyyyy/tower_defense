// ui script

import global from './global'

cc.Class({
    extends: cc.Component,

    properties: {
		countDownLabel: {
			default: null,
			type: cc.Label,
		}
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
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

    start () {

    },
});
