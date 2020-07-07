// tower script
import global from './global'

cc.Class({
    extends: cc.Component,

    properties: {
		spriteNode: {
			default: null,
			type: cc.Sprite,
		},
		bulletSprite: {
			default: null,
			type: cc.SpriteFrame,
		},
		bulletPrefab: {
			default: null,
			type: cc.Prefab,
		},
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
		this.setLevel(0);
		this.level = 0;
		// can fire immediately
		this.attackTimer = 1e6;
	},
	
	configure: function (data, pos) {
		this.node.position = pos;
		this.levelData = data.levels;
	},

	upgrade: function () {
		// cc.log("upgrade_tower " + this.level + ", " + this.spriteFrames.length);
		this.setLevel(this.level + 1);
	},
	
	setLevel: function (level) {
		if (level >= this.levelData.length) {
			return false;
		}

		this.level = level;
		let ldata = this.levelData[level];
		this.atk = ldata.atk;
		this.range = ldata.atk_range;
		this.view = ldata.view_range;
		this.aspd = ldata.aspd;
		this.bulletSpeed = ldata.bullet_speed;


		cc.loader.loadRes(ldata.sprite, cc.SpriteFrame, (err, result) => {
			if (err) {
				cc.log("Failed to load sprite: " + err);
			} else {
				this.spriteNode.spriteFrame = result;
			}
		});
		
		cc.loader.loadRes(ldata.bullet_sprite, cc.SpriteFrame, (err, result) => {
			if (err) {
				cc.log("Failed to load sprite: " + err);
			} else {
				this.bulletSprite = result;
			}
		});
		
		return true;
	},
	
	searchEnemy: function (enemies) {
		// no need to search
		if (this.enemy != undefined) { return; }
		
		// search for enemy
		var search = (enemies, range) => {
			for (var enemy of enemies) {
				if ((enemy != undefined) && (this.node.position.sub(enemy.position).mag() <= range)) {
					this.setEnemy(enemy);
					return true;
				}
			}
		}
		
		// search any enemy in range first, if none, try view
		if(!search(enemies, this.range)) {
			search(enemies, this.view);
		}
	},
	
	setEnemy: function (enemy) {
		this.enemy = enemy;
		global.event.register("enemy" + this.enemy.nid, () => { this.enemy = undefined; });
		// this.attackTimer = 0.;
	},
		
	update: function (dt) {
		this.attackTimer += dt;
		if (this.enemy != undefined) {
			let direction = this.node.position.sub(this.enemy.position);
			this.node.angle = -cc.v2(direction.x, direction.y).signAngle(cc.v2(0, -1))/Math.PI*180.;
			
			if (this.node.position.sub(this.enemy.position).mag() > this.range) {
				this.enemy = undefined;
			} else {
				this.attack(this.enemy);
			}
		}
	},
	
	attack: function (target, dt) {
		if (this.attackTimer >= 1./this.aspd) {
			this.attackTimer = 0.;
			let bullet = cc.instantiate(this.bulletPrefab);
			bullet.getComponent("bullet").fire(target, this.bulletSprite, this.bulletSpeed, this.atk);
			bullet.position = this.node.position.add(target.position.sub(this.node.position).normalize().mul(100));
			bullet.angle = this.node.angle;
			bullet.parent = this.node.parent;
		}
	},
	
    start () {

    },

    // update (dt) {},
});
