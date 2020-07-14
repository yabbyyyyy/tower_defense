// animation script
import global from './global'

const UnitState = require("unit_state");


cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS
    initAnimation: function (data) {
        if (!this.sprites) {
            this.sprites = [];
            // 15 subframes
            for (let i = 0; i < 15; ++i) {
                var node = new cc.Node("sprite");
                this.sprites.push(node.addComponent(cc.Sprite));
                node.parent = this.node;
            }
        }
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

        let size = this.frames[0].getOriginalSize();
        return cc.v2(size.width*this.scale, size.height*this.scale);
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

    playAnimeOnce: function (sid, time = -1, restore = true) {
        let speed = 1.0;
        if (time > 0) {
            speed = this.getAnimeDuration(sid)/time;
        }
        this.playAnime(sid, 1, speed, restore);
    },
    
	setFrame: function (animeSet, fid, mirror = 0) {
        let image_n = animeSet.image_n[fid];
        let direction = animeSet.direction[fid];
        let scale_x = animeSet.scale_x[fid];
        let scale_y = animeSet.scale_y[fid];
        let offset_x = animeSet.offset_x[fid];
        let offset_y = animeSet.offset_y[fid];
        let rotation = animeSet.rotation[fid];
        let opacity = animeSet.opacity[fid];

        // loop over all subframes
        for (let i = 0; i < this.sprites.length; ++i) {
            if (i >= image_n.length) {
                this.sprites[i].spriteFrame = null;
                continue;
            }
            this.sprites[i].spriteFrame = this.frames[image_n[i]];
            this.sprites[i].spriteFrame.setFlipX(mirror ^ direction[i]);
            this.sprites[i].node.scale = cc.v2(this.scale * scale_x[i], this.scale * scale_y[i]);
            this.sprites[i].node.position = cc.v2(offset_x[i], offset_y[i]);
            this.sprites[i].node.angle = rotation[i] * (mirror ? -1 : 1);
            this.sprites[i].node.opacity = opacity[i];
        }
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
        return this.node.position.add(this.sprites[0].node.position);
    },
    // onLoad () {},

    start () {

    },

    // update (dt) {},
});

