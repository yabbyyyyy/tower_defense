// bullet script
import global from "./global"

const BulletState = {
	Undefined: -1,
	Idle: 0,
	Move: 1,
	Goal: 2,
};

cc.Class({
    extends: cc.Component,

    properties: {
		spriteNode: {
			default: null,
			type: cc.Sprite,
		}
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {},
	
	fire: function (target, sprite, speed, hit) {
		this.spriteNode.spriteFrame = sprite;
		this.speed = speed;
		this.target = target;
		this.hit = hit;
		this.setState(BulletState.Move);
		global.event.register("enemy" + this.target.nid, () => { this.target = undefined; });
	},
	
	update: function (dt) {
		if (this.target) {
			let dvec = this.target.position.sub(this.node.position);
			this.node.angle = -cc.v2(dvec.x, dvec.y).signAngle(cc.v2(0, 1))/Math.PI*180.;
			let dist = dvec.mag();
			let moved = dt*this.speed;
			
			if (moved >= dvec.mag()) {
				this.node.position = this.target.position;
				this.setState(BulletState.Goal);
			} else {
				let dir = dvec.normalize();
				this.node.position = this.node.position.add(dir.mul(moved));
			}
		} else {
			this.setState(BulletState.Goal);
		}
	},
	
	setState: function (state) {
		if (this.state == state) {
			return;
		}
		
		switch (state) {
		case BulletState.Undefined:
		case BulletState.Idle:
			this.node.opacity = 0;
			break;
		case BulletState.Move:
			break;		
		case BulletState.Goal:
			this.node.destroy();
			if (this.target) {
				this.target.getComponent("enemy").damage(this.hit);
			}
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
