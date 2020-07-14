// tower script
import global from './global'


// default properties
const default_prop = {
	range: 300,
	view: 400,
	aspd: 1.0,
	bullet_speed: 1000,
	atk: 0,
	crit: 0,
	crit_mod: 100,
	aoe_range: -1,
	recover: 0.3,
	lock: true,
};

function update_dict (my_hit, data) {
	for (var key in my_hit) {
		if (key in data) {
			my_hit[key] = data[key];
		}
	}
	return my_hit;
};

cc.Class({
    extends: cc.Component,

    properties: {
		sprite: {
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

		// copy initial property
		if (!this.hasOwnProperty("prop")) {
			this.prop = Object.assign({}, default_prop);
		}
		this.prop = update_dict(this.prop, ldata);
		// update sprite
		if (ldata.hasOwnProperty("sprite")) {
			cc.resources.load(ldata.sprite, cc.SpriteFrame, (err, result) => {
				if (err) {
					cc.log("Failed to load sprite: " + err);
				} else {
					this.sprite.spriteFrame = result;
				}
			});
		}

		// update bullet sprite
		if (ldata.hasOwnProperty("bullet_sprite")) {
			cc.resources.load(ldata.bullet_sprite, cc.SpriteFrame, (err, result) => {
				if (err) {
					cc.log("Failed to load sprite: " + err);
				} else {
					this.bulletSprite = result;
				}
			});
		}
		
		return true;
	},
	
	searchEnemy: function (enemies) {
		// no need to search
		if (this.enemy != undefined) { return; }
		
		// search for enemy
		var search = (enemies, range) => {
			for (var enemy of enemies) {
				if ((enemy != undefined) && (this.node.position.sub(enemy.node.position).mag() <= range)) {
					this.setEnemy(enemy);
					return true;
				}
			}
		}
		
		// search any enemy in range first, if none, try view
		if(!search(enemies, this.prop.range)) {
			search(enemies, this.prop.view);
		}
	},
	
	setEnemy: function (enemy) {
		this.enemy = enemy;
		global.event.register("enemy" + enemy.nid, () => { this.enemy = undefined; });
		// this.attackTimer = 0.;
	},
		
	update: function (dt) {
		this.attackTimer += dt;
		if (this.enemy != undefined) {
			let direction = this.node.position.sub(this.enemy.node.position);
			this.node.angle = -cc.v2(direction.x, direction.y).signAngle(cc.v2(0, -1))/Math.PI*180.;
			
			if (this.node.position.sub(this.enemy.node.position).mag() > this.prop.range) {
				this.enemy = undefined;
			} else {
				this.attack(this.enemy);
			}
		}
	},
	
	attack: function (target, dt) {
		if (this.attackTimer >= global.battle.atk_interval(this.prop.aspd)) {
			this.attackTimer = 0.;
			let bullet = cc.instantiate(this.bulletPrefab);
			let bulletPos = this.node.position.add(target.node.position.sub(this.node.position).normalize().mul(100));
			bullet.getComponent("bullet").fire(bulletPos, target, this.prop, this.bulletSprite);
			bullet.angle = this.node.angle;
			bullet.parent = this.node.parent;
		}
	},
	
    start () {

    },

    // update (dt) {},
});
