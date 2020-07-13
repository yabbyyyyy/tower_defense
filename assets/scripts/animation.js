// animation script
import global from './global'

const UnitState = require("unit_state");


cc.Class({
    extends: cc.Component,

    properties: {
		sprite: {
			default: null,
			type: cc.Sprite,
		},
    },

    // LIFE-CYCLE CALLBACKS
    initAnimation: function (data) {
		// animation frames
		this.frames = [];
		for (let rect of data.frameRects) {
			let size = cc.size(rect[2], rect[3]);
			let frame = new cc.SpriteFrame;
			frame.setTexture(data.texture, cc.rect(...rect), false, cc.v2.zero, size);
			this.frames.push(frame);
		}
		this.animations = data.animations;
		this.animTimer = 0.;
		this.scale = data.scale;

		// first frame
		this.frameId = 0;
		this.animeId = 0;
		this.animeSet = data.anime_set;
		// let maxSet = Math.floor(this.animations.length/8);
		// this.setAnimation(this.nid % maxSet);
		this.setFrame(0);
    },

    // this should be called inside update(dt)
    animeUpdate: function (dt) {
    	// animation
		if (this.currAnim && ((this.frameId < this.currAnim.image_n.length - 1) || this.animRepeat)) {
			// speed unit is 40 ms
			this.animTimer += dt*25;
			// reset timer
			if (this.animTimer >= this.currAnim.speed) {
				this.animTimer = 0.;
				this.frameId = (this.frameId + 1) % this.currAnim.image_n.length;
				this.setFrame(this.frameId);
			}
		}
    },

    getAnimeDuration: function () {
		return this.currAnim.image_n.length * this.currAnim.speed * 0.04;
	},
	
	setState: function (state) {
		if (this.state == state) {
			return;
		}
		
		switch (state) {
		case UnitState.Undefined:
		case UnitState.Idle:
		case UnitState.Move:
            this.setAnimation(UnitState.Move);
			break;
		case UnitState.Goal:
			global.event.trigger("enemy_goal");
			global.event.trigger("enemy" + this.nid, this.nid);
			global.event.off("enemy" + this.nid);
			this.node.destroy();
			break;
		// intended fall through
		case UnitState.Dead:
			this.hbar.node.active = false;
			global.event.trigger("enemy" + this.nid, this.nid);
			global.event.off("enemy" + this.nid);
			this.setAnimation(UnitState.Dead, this.direction, false);
            let duration = 2.0; // this.getAnimeDuration();
            cc.tween(this.node)
                .to(duration, {opacity: 0})
                .call(this.node.destroy.bind(this.node))
                .start();
			// this.node.runAction(cc.sequence(cc.fadeOut(duration), cc.callFunc(this.node.destroy, this.node)));
			break;
		default:
			break;
		}
		
		// save previous state
		this.prevState = this.state;
		this.state = state;
		// cc.log("Set Enemy State: " + this.state);
    },

	findDirection: function (dest) {
        let diff = dest.sub(this.node.position);
		if (diff.mag() > 0) {
			this.direction = diff.normalize();
			this.setAnimation();
		}
	},
	
    setAnimation: function (sid = -1, dir = this.direction, repeat = true) {
		if (sid < 0) {
			sid = Math.floor(this.animeId/8);
		}
		if (!this.animations || ((sid + 1)*8 > this.animations.length)) {
			return false;
		}
		let did = (Math.floor(dir.angle(cc.v2(0, 1))/Math.PI*4.) + 4) % 8;
		let aid = sid * 8 + did;
		if (aid != this.animeId) {
			this.animeId = aid;
			this.currAnim = this.animations[aid];
			this.animRepeat = repeat;
			this.animTimer = 0;
			this.frameId = 0;
		}
		return true;
    },
    
	setFrame: function (fid) {
		if (!this.currAnim || fid >= this.currAnim.image_n.length) {
			return false;
		}
		let imid = this.currAnim.image_n[fid];
		this.sprite.spriteFrame = this.frames[imid];
		this.sprite.spriteFrame.setFlipX(this.currAnim.direction[fid]);
		let size = this.sprite.spriteFrame.getOriginalSize();
		this.sprite.node.width = size.width*this.scale*this.currAnim.scale_x[fid];
		this.sprite.node.height = size.height*this.scale*this.currAnim.scale_y[fid];
		this.sprite.node.position = cc.v2(this.currAnim.offset_x[fid], this.currAnim.offset_y[fid]);
		this.sprite.node.angle = -this.currAnim.rotation[fid];
		return true;
	},

    // onLoad () {},

    start () {

    },

    // update (dt) {},
});

