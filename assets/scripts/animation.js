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
        if (!this.direction) {
            this.direction = cc.v3(0, -1, 0);
        }
        this.animations = data.animations;
        if (data.scale) {
            this.scale = data.scale;
        } else {
            this.scale = 1.0;
        }
    },

	findDirection: function (dest) {
        let diff = dest.sub(this.node.position);
		if (diff.mag() > 0) {
			this.direction = diff.normalize();
		}
	},
    
    getAnimeDuration: function (sid) {
        if (!this.animations || !this.animations.hasOwnProperty(sid)) {
            return 0.;
        }
        let face = this.direction.y <= 0 ? 0 : 1;
        return this.animations[sid][face].speed * this.animations[sid][face].image_n.length;
    },
    // play the corresponding animation for a number of times, nums < 0 means inifinite repeats
    // set restore to restore the previous anime play state
    // default speed unit is 40 ms (1000./40.)
    playAnime: function (sid, nums = 1, speed = 1.0, restore = false) {
        if (!this.animations || !this.animations.hasOwnProperty(sid)) {
            return false;
        }

        let playState = {sid, nums, speed, restore};
        // repeat playing, only refresh timer
        if (this.playState && (playState == this.playState)) {
            this.animTimer = 0;
            this.frameId = 0;
        } else {
            this.currAnim = this.animations[sid];
		    this.animTimer = 0;
            this.frameId = 0;
            if (restore & !this.prevPlayState) {
                this.prevPlayState = this.playState;
            }
            this.playState = playState
        }
		return true;
    },
    
	setFrame: function (animeSet, fid, mirror = 0) {
        let imid = animeSet.image_n[fid];
		this.sprite.spriteFrame = this.frames[imid];
		this.sprite.spriteFrame.setFlipX(mirror ^ animeSet.direction[fid]);
		this.sprite.node.scale = cc.v2(this.scale * animeSet.scale_x[fid], this.scale * animeSet.scale_y[fid]);
		this.sprite.node.position = cc.v2(animeSet.offset_x[fid], animeSet.offset_y[fid]);
		this.sprite.node.angle = animeSet.rotation[fid];
	},

    // this should be called inside update(dt)
    animeUpdate: function (dt) {
        // change anime
        if (this.playState && (this.playState.nums == 0)) {
            if (this.playState.restore && this.prevPlayState) {
                this.playAnime(this.prevPlayState.sid, this.prevPlayState.nums, this.prevPlayState.speed);
                this.prevPlayState = undefined;
            }
            return;
        }

        // sanity check
        if (!this.currAnim) {
            return;
        }
        
        this.animTimer += dt*this.playState.speed*25;
        // check facing direction
        let face = this.direction.y <= 0 ? 0 : 1;

        if (this.animTimer >= this.currAnim[face].speed) {
            this.animTimer = 0;
            this.frameId += 1;

            // check if frame id exceeds the maximum numbers
            let nFrames = this.currAnim[face].image_n.length;
            if (this.frameId >= nFrames) {
                this.playState.nums -= 1;
                this.frameId = this.frameId % nFrames;
            }
            
            if (this.playState.nums != 0) {
                let mirror = this.direction.x <= 0 ? 0 : 1;
                this.setFrame(this.currAnim[face], this.frameId, mirror ^ face);
            }
        }
    },

    getCenterPos: function() {
        return this.node.position.add(this.sprite.node.position);
    },
    // onLoad () {},

    start () {

    },

    // update (dt) {},
});

