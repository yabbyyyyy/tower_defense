// game layer script
import global from './global'

cc.Class({
    extends: cc.Component,

    properties: {
		levelsConfig: {
			default: null,
			type: cc.JsonAsset,
		},
		enemiesConfig: {
			default: null,
			type: cc.JsonAsset,
		},
		towersConfig: {
			default: null,
			type: cc.JsonAsset,
		},
		levelPrefabs: {
			default: [],
			type: cc.Prefab
		},
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
		let level = cc.instantiate(this.levelPrefabs[0]);
		let levelData = this.levelsConfig.json[level.name];
		let enemyData = this.loadEnemies(levelData);
		let towerData = this.loadTowers();

		level.getComponent("level").configure(levelData, enemyData, towerData);
		level.parent = this.node;
	},

	loadEnemies: function (levelData) {
		let enemyData = {};
		for (let wave of levelData.waves) {
			if (enemyData.hasOwnProperty(wave.id) || !this.enemiesConfig.json.hasOwnProperty(wave.id)) {
				continue;
			}
			let conf = this.enemiesConfig.json[wave.id];
			enemyData[wave.id] = conf;
			this.loadAnimation(enemyData[wave.id], "sprites/" + conf.sprite);
		}
		return enemyData;
	},

	loadTowers: function () {
		for (var tid of Object.keys(this.towersConfig.json)) {
			let tower = this.towersConfig.json[tid];
			for (let level of tower.levels) {
				this.loadAnimation(level, "sprites/" + level.sprite);
				// bullet sprite
				if (level.hasOwnProperty("bullet_sprite")) {
					cc.resources.load('sprites/' + level.bullet_sprite, cc.SpriteFrame, (err, frame) => {
						if (err) {
							cc.log(err + ": sprites/" + level.bullet_sprite);
						} else {
							level.bulletSprite = frame;
						}
					});
				}
			}
		}
		return this.towersConfig.json;
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
