// game layer script
import global from './global'

cc.Class({
    extends: cc.Component,
    properties: {
		levelPrefabs: {
			default: [],
			type: cc.Prefab
		},
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
		// load configurations
		cc.resources.loadDir("configs", cc.JsonAsset, (err, assets) => {
			if (err) { cc.log(err); return ; }
			this.configs = {};
			for (let asset of assets) {
				this.configs[asset.name] = asset.json;
			}
			this.loadEnemies(this.configs['enemies']);
			this.loadTowers(this.configs['towers']);
			this.startLevel(0);
		});
		global.battle.game = this;
	},

	startLevel: function (lvl) {
		// instantiate level
		let level = cc.instantiate(this.levelPrefabs[lvl]);
		let levelData = this.configs["levels"][level.name];
		let enemyData = this.configs['enemies'];
		let towerData = this.configs['towers'];
		level.getComponent("level").configure(levelData, enemyData, towerData);
		level.parent = this.node;
		this.currLevel = level;
	},

	loadEnemies: function (enemies) {
		for (var tid of Object.keys(enemies)) {
			let enemy = enemies[tid];
			this.loadAnimation(enemy, "sprites/" + enemy.sprite);
		}
	},

	loadTowers: function (towers) {
		for (var tid of Object.keys(towers)) {
			let tower = towers[tid];
			for (let level of tower.levels) {
				this.loadAnimation(level, "sprites/" + level.sprite);
				// bullet sprite
				if (level.hasOwnProperty("bullet_sprite")) {
					cc.resources.load('textures/' + level.bullet_sprite, cc.SpriteFrame, (err, frame) => {
						if (err) { cc.log(err); return; }
						level.bulletSprite = frame;
					});
				}
			}
		}
	},

	loadAnimation: function (container, path) {
		// animation actions
		cc.resources.load(path, cc.JsonAsset, (err, res) => {
			if (err) {
				cc.log(err + ": " + path);
			} else {
				container.frameRects = res.json.frame_rects;
				container.animations = res.json.animations;
			}
		});

		// animation texture
		cc.resources.load(path, cc.Texture2D, (err, tex) => {
			if (err) {
				cc.log(err + ": " + path);
			} else {
				container.texture = tex;
			}
		});
	},

    start () {

    },

    // update (dt) {},
});
