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
		spriteNode: {
			default: null,
			type: cc.Sprite,
		},
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
		// place holder
	},
	
	configure: function (nid, data, pathPoints) {
		this.node.nid = nid;
		// cc.log(JSON.stringify(data));
		cc.loader.loadRes(data.sprite, cc.SpriteFrame, (err, result) => {
			if (err) {
				cc.log("Failed to load sprite: " + err);
			} else {
				this.spriteNode.spriteFrame = result;
			}
		});
		// basic attributes
		this.hp = data.hp;
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
	},
	
	setState: function (state) {
		if (this.state == state) {
			return;
		}
		
		switch (state) {
		case EnemyState.Undefined:
		case EnemyState.Idle:
			this.node.opacity = 0;
			break;
		case EnemyState.Move:
			break;
		case EnemyState.Goal:
			global.event.trigger("enemy_goal");
		// intended fall through
		case EnemyState.Dead:
			// notify destroy
			global.event.trigger("enemy" + this.node.nid, this.node.nid);
			global.event.off("enemy" + this.node.nid);
			this.node.destroy();
		default:
			break;
		}
		
		// save previous state
		this.prevState = this.state;
		this.state = state;
		// cc.log("Set Enemy State: " + this.state);
	},
	
	damage: function (atk) {
		this.hp -= atk - this.defense;
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
