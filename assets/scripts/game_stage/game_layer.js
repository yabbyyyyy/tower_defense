// game layer script
import global from '../utils/global'

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
			this.loadEnemies(this.configs['levels'][global.currLevel]);
			this.loadTowers(this.configs['towers']);
			this.startLevel(global.currLevel);
		});
		global.battle.game = this;
	},

	startLevel: function (lvl) {
		// instantiate level
		let level = cc.instantiate(this.levelPrefabs[0]);
		let levelData = this.configs["levels"][lvl];
		let towerData = this.configs['towers'];
		level.getComponent("level").configure(levelData, this.monsterRes, towerData);
		level.parent = this.node;
		this.currLevel = level;
	},

	loadEnemies: function (level) {
		this.monsterRes = {};
		let waves = level.waves;
		for (let wave of waves) {
			let sprite = wave.monster.sprite;
			if (!this.monsterRes.hasOwnProperty(sprite)) {
				this.monsterRes[sprite] = {};
				this.loadAnimation(this.monsterRes[sprite], "sprites/" + sprite);
			}
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
