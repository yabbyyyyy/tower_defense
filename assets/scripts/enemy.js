// enemy script
import global from './global'

const EnemyState = {
	Undefined: -1,
	Idle: 0,
	Move: 1,
	Attack: 2,
	Damage: 3,
	Dead: 4,
	Action1: 5,
	Action2: 6,
	Action3: 7,
	Action4: 8,
	Action5: 9,
	Goal: 21,
};


cc.Class({
    extends: cc.Component,

    properties: {
		sprite: {
			default: null,
			type: cc.Sprite,
		},
		healthBarPrefab: {
			default: null,
			type: cc.Prefab,
		},
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
		// place holder
	},
	
	onDestroy: function () {
		// its parent is game_ui, so destroy it explicitly
		this.hbar.node.destroy();
	},

	configure: function (nid, data, pathPoints) {
		this.nid = nid;
		// basic attributes
		this.hp = data.hp;
		this.maxHp = data.hp;
		this.defense = data.defense;
		this.speed = data.speed;
		
		// path and direction
		this.pathPoints = pathPoints;
		this.currPt = 0;
		this.node.position = pathPoints[0].position;
		this.findDirection(pathPoints[1].position);

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
		this.setAnimation(EnemyState.Move);
		this.setFrame(0);

		// configure health bar
		let hbarNode = cc.instantiate(this.healthBarPrefab);
		this.hbar = hbarNode.getComponent(cc.ProgressBar);
		hbarNode.zIndex = 1;
		this.hbar.progress = 1.0;		
				
		this.updateHbarWidth(this.scale);
		this.updateHbarPos();
		// hide health bar first
		hbarNode.active = false;
		// put it on the UI layer
		hbarNode.parent = global.battle.uiLayer.node;
		
		// state
		this.setState(EnemyState.Move);
		this.node.opacity = 255;
	},

	updateHbarWidth: function (scale = 1.0) {
		let hwidth = this.sprite.node.width*scale;
		this.hbar.node.width = hwidth;
		this.hbar.totalLength = hwidth;
		this.hbar.node.getChildByName("bar").position = cc.v3(-hwidth/2., 0, 0);
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
		this.sprite.node.position = cc.v2(this.currAnim.offset_x[fid], -this.currAnim.offset_y[fid]);
		this.sprite.node.angle = -this.currAnim.rotation[fid];
		return true;
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

	getAnimeDuration: function () {
		return this.currAnim.image_n.length * this.currAnim.speed * 0.04;
	},
	
	update: function (dt) {
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

		// move
		if (this.state == EnemyState.Move) {
			let dest = this.pathPoints[this.currPt + 1].position;
			let dist = dest.sub(this.node.position).mag();
			let moved = dt*this.speed;
			
			// cannot reach the next point yet
			if (dist > moved) {
				this.node.position = this.node.position.add(this.direction.mul(moved));
			// reach the point
			} else {
				this.node.position = dest;
				this.currPt++;
				// check the next point
				// cc.log(this.currPt + ", " + this.pathPoints.length);
				if (this.currPt >= this.pathPoints.length - 1) {
					this.setState(EnemyState.Goal);
				} else {
					// move the residual part
					dest = this.pathPoints[this.currPt + 1].position;
					this.findDirection(dest);
					this.node.position = this.node.position.add(this.direction.mul(moved - dist));
				}
			}
		}
		this.updateHbarPos();
	},

	updateHbarPos: function () {
		if (this.hbar.node.active) {
			this.hbar.node.position = this.node.position.add(cc.v2(0, this.sprite.node.height));
		}
	},
	
	setState: function (state) {
		if (this.state == state) {
			return;
		}
		
		switch (state) {
		case EnemyState.Undefined:
		case EnemyState.Idle:
		case EnemyState.Move:
			break;
		case EnemyState.Goal:
			global.event.trigger("enemy_goal");
			global.event.trigger("enemy" + this.nid, this.nid);
			global.event.off("enemy" + this.nid);
			this.node.destroy();
			break;
		// intended fall through
		case EnemyState.Dead:
			this.hbar.node.active = false;
			global.event.trigger("enemy" + this.nid, this.nid);
			global.event.off("enemy" + this.nid);
			this.setAnimation(EnemyState.Dead, this.direction, false);
			let duration = 2.0; // this.getAnimeDuration();
			this.node.runAction(cc.sequence(cc.fadeOut(duration), cc.callFunc(this.node.destroy, this.node)));
			break;
		default:
			break;
		}
		
		// save previous state
		this.prevState = this.state;
		this.state = state;
		// cc.log("Set Enemy State: " + this.state);
	},
	
	damage: function (damage) {
		this.hp -= damage;
		this.hbar.node.active = true;
		this.hbar.progress = Math.max(this.hp, 0)/this.maxHp;
		if (this.hp <= 0) {
			this.setState(EnemyState.Dead);
		}
	},

	findDirection: function (dest) {
		if (this.currPt < this.pathPoints.length - 1) {
			this.direction = dest.sub(this.node.position).normalize();
			this.setAnimation();
		}
	},
	
    start () {

    },

});
