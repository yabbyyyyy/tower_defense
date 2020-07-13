// enemy script
import global from './global'

var animeComponent = require("animation");
const UnitState = require("unit_state");

cc.Class({
	extends: animeComponent,

    properties: {
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

		// initialize animation
		this.initAnimation(data);

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
		this.setState(UnitState.Move);
		this.node.opacity = 255;
	},

	updateHbarWidth: function (scale = 1.0) {
		let hwidth = this.sprite.node.width*scale;
		this.hbar.node.width = hwidth;
		this.hbar.totalLength = hwidth;
		this.hbar.node.getChildByName("bar").position = cc.v3(-hwidth/2., 0, 0);
	},

	updateHbarPos: function () {
		if (this.hbar.node.active) {
			this.hbar.node.position = this.node.position.add(cc.v2(0, this.sprite.node.height));
		}
	},

	update: function (dt) {
		this.animeUpdate(dt);
		// move
		if (this.state == UnitState.Move) {
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
					this.setState(UnitState.Goal);
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
	
	damage: function (damage) {
		this.hp -= damage;
		this.hbar.node.active = true;
		this.hbar.progress = Math.max(this.hp, 0)/this.maxHp;
		if (this.hp <= 0) {
			this.setState(UnitState.Dead);
		}
	},

    start () {

    },

});
