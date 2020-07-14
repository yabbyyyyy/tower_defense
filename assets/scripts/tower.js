// tower script
import global from './global'

var animeComponent = require("animation");
const UnitState = require("unit_state");

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
    extends: animeComponent,
    properties: {
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

		this.findDirection(cc.v3(-5000, -5000, 0));
		this.initAnimation(ldata);
		this.playAnime(UnitState.Idle, -1);

		this.bulletScale = 1.0;
		if (ldata.bullet_scale) {
			this.bulletScale = ldata.bullet_scale;
		}

		if (ldata.bulletSprite) {
			this.bulletSprite = ldata.bulletSprite;
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
		this.animeUpdate(dt);
		this.attackTimer += dt;
		if (this.enemy != undefined) {
			this.findDirection(this.enemy.getCenterPos());
			if (this.node.position.sub(this.enemy.node.position).mag() > this.prop.range) {
				this.enemy = undefined;
			} else {
				this.attack(this.enemy);
			}
		}
	},
	
	attack: function (target, dt) {
		let interval = global.battle.atk_interval(this.prop.aspd);
		if (this.attackTimer >= interval) {
			this.attackTimer = 0.;
			// attack anime
			this.playAnimeOnce(UnitState.Attack, interval);
			// fire bullets
			let bullet = cc.instantiate(this.bulletPrefab);
			let bulletPos = this.getCenterPos().add(this.direction.mul(100));
			bullet.getComponent("bullet").fire(bulletPos, target, this.prop, this.bulletScale, this.bulletSprite);
			bullet.getComponent("bullet").updateAngle();
			bullet.parent = this.node.parent;
		}
	},
	
    start () {

    },

    // update (dt) {},
});
