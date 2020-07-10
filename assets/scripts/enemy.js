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
		// cc.log(JSON.stringify(data));
		cc.loader.loadRes(data.sprite, cc.SpriteFrame, (err, result) => {
			if (err) {
				cc.log("Failed to load sprite: " + err);
			} else {
				this.sprite.spriteFrame = result;
			}
		});
		// basic attributes
		this.hp = data.hp;
		this.maxHp = data.hp;
		this.defense = data.defense;
		this.speed = data.speed;
		
		// direction and state
		this.pathPoints = pathPoints;
		this.currPt = 0;
		this.node.position = pathPoints[0].position;
		this.findDirection(pathPoints[1].position);
		this.setState(EnemyState.Move);
		this.node.opacity = 255;
	},
	
	update: function (dt) {
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
	
	damage: function (hit) {
		this.hp -= global.battle.damage(hit, this);
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
