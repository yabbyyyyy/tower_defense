// bullet script
import global from "./global"

const { UnitState } = require("../utils/states");


cc.Class({
    extends: cc.Component,

    properties: {
		sprite: {
			default: null,
			type: cc.Sprite,
		}
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {},
	
	fire: function (pos, target, hit, scale, spriteFrame) {
		this.node.position = pos;
		this.sprite.spriteFrame = spriteFrame;
		this.sprite.node.scale = cc.v2(scale, scale);
		this.hit = hit;
		this.setState(UnitState.Move);
		this.setDestination(target.getCenterPos());
		if (this.hit.lock) {
			this.target = target;
			global.event.register("null_target" + this.target.nid, () => {this.target = undefined; });
		}
	},

	setDestination(position) {
		this.dest = cc.v2(position.x, position.y);
	},
	
	update: function (dt) {
		// update destination
		if (this.target && (this.hit.lock)) {
			this.setDestination(this.target.getCenterPos());
		}

		if (this.state == UnitState.Move) {
			let dir = this.updateAngle();
			let moved = dt*this.hit.bullet_speed;
			let dist = this.dest.sub(this.node.position).mag();
		
			if (moved >= dist) {
				this.node.position = this.dest;
				this.setState(UnitState.Goal);
			} else {
				this.node.position = this.node.position.add(dir.mul(moved));
			}
		}
	},

	updateAngle: function() {
		let dir = this.dest.sub(this.node.position).normalize();
		this.node.angle = -dir.signAngle(cc.v2(0, 1))/Math.PI*180.;
		return dir;
	},
	
	setState: function (state) {
		if (this.state == state) {
			return;
		}
		
		switch (state) {
		case UnitState.Undefined:
		case UnitState.Idle:
			this.node.opacity = 0;
			break;
		case UnitState.Move:
			break;		
		case UnitState.Goal:
			this.node.destroy();
			global.battle.damage(this.hit, this.target, this.dest);
			break;
		default:
			break;
		}
		
		// save previous state
		this.prevState = this.state;
		this.state = state;
		// cc.log("Set Enemy State: " + this.state);
	},
	
    start () {
		
    },

    // update (dt) {},
});
