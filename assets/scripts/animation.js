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
		this.animTimer = 0.;
        this.scale = data.scale;
    },

	findDirection: function (dest) {
        let diff = dest.sub(this.node.position);
		if (diff.mag() > 0) {
			this.direction = diff.normalize();
		}
	},
    
    // play the corresponding animation for a number of times, nums < 0 means inifinite repeats
    playAnime: function (sid, nums = 1) {
        let aid = sid*2 + (this.direction.y <= 0 ? 0 : 1);
        if (!this.animations || aid >= this.animations.length) {
            return false;
        }

		if (!this.animeId || (aid != this.animeId)) {
            this.animeId = aid;
            this.currAnim = this.animations[aid];
			this.numPlays = nums;
			this.animTimer = 0;
            this.frameId = 0;
		}
		return true;
    },
    
	setFrame: function (fid, mirror = 0) {
        let animeSet = this.currAnim;
        let imid = animeSet.image_n[fid];
		this.sprite.spriteFrame = this.frames[imid];
		this.sprite.spriteFrame.setFlipX(mirror ^ animeSet.direction[fid]);
		let size = this.sprite.spriteFrame.getOriginalSize();
		this.sprite.node.width = size.width * this.scale * animeSet.scale_x[fid];
		this.sprite.node.height = size.height * this.scale * animeSet.scale_y[fid];
		this.sprite.node.position = cc.v2(animeSet.offset_x[fid], animeSet.offset_y[fid]);
		this.sprite.node.angle = -animeSet.rotation[fid];
	},

    // this should be called inside update(dt)
    animeUpdate: function (dt) {
        if (!this.currAnim || (this.numPlays == 0)) {
            return;
        }
        // speed unit is 40 ms
        this.animTimer += dt*25;

        if (this.animTimer >= this.currAnim.speed) {
            this.animTimer = 0;
            this.frameId += 1;
            // check if we need to change set
            let face = this.direction.y <= 0 ? 0 : 1;
            if (face != (this.animeId % 2)) {
                this.animeId = Math.floor(this.animeId/2)*2 + face;
                this.currAnim = this.animations[this.animeId];
            }
            // check if frame id exceeds the maximum numbers
            let nFrames = this.currAnim.image_n.length;
            if (this.frameId >= nFrames) {
                this.numPlays -= 1;
                this.frameId = this.frameId % nFrames;
            }
            
            if (this.numPlays != 0) {
                let mirror = this.direction.x <= 0 ? 0 : 1;
                this.setFrame(this.frameId, mirror ^ face);
            }
        }
    },
    // onLoad () {},

    start () {

    },

    // update (dt) {},
});

