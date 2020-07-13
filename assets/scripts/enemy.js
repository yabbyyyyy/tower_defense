// enemy script
import global from './global'

const EnemyState = {
	Undefined: -1,
	Idle: 0,
	Move: 1,
	Dead: 2,
	Goal: 3,
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
		let hbarNode = cc.instantiate(this.healthBarPrefab);
		this.hbar = hbarNode.getComponent(cc.ProgressBar);

		// configure health bar
		hbarNode.zIndex = 1;
		let hwidth = this.sprite.node.width;
		hbarNode.width = hwidth;
		this.hbar.totalLength = hwidth;
		hbarNode.getChildByName("bar").position = cc.v3(-hwidth/2., 0, 0);
		this.hbar.progress = 1.0;

		// hide health bar first
		hbarNode.active = false;
		this.updateHbarPos();

		// put it on the UI layer
		hbarNode.parent = global.battle.uiLayer.node;
	},
	
	onDestroy: function () {
		// notify destroy
		global.event.trigger("enemy" + this.nid, this.nid);
		global.event.off("enemy" + this.nid);
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

		// animation
		this.frames = data.frames;
		this.currAnim = data.animations[this.nid % data.animations.length];
		this.animTimer = 0.;
		this.animId = 0;

		// state
		this.setState(EnemyState.Move);
		this.node.opacity = 255;
	},
	
	update: function (dt) {
		// animation
		if (this.currAnim) {
			// speed unit is 40 ms
			this.animTimer += dt*25;
			// reset timer
			if (this.animTimer >= this.currAnim.speed) {
				this.animTimer = 0.;
				this.animId += 1;
				if (this.animId >= this.currAnim.image_n.length) {
					this.animId = 0;
				}
				// frame id
				let fid = this.animId;
				this.sprite.spriteFrame = this.frames[this.currAnim.image_n[fid]];
				this.sprite.spriteFrame.setFlipX(this.currAnim.direction[fid]);
				this.sprite.spriteFrame.setOffset(cc.v2(this.currAnim.offset_x[fid], this.currAnim.offset_y[fid]));
				this.sprite.node.angle = this.currAnim.rotation[fid];
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
		// intended fall through
		case EnemyState.Dead:
			this.node.destroy();
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
		}
	},
	
    start () {

    },

});
