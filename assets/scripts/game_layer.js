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
			// load animations
			cc.resources.load("sprites/" + conf.sprite, cc.JsonAsset, (err, res) => {
				if (err) {
					cc.log(err);
				} else {
					enemyData[wave.id].frameRects = res.json.frame_rects;
					enemyData[wave.id].animations = res.json.animations;
				}
			});
			// this has to be inside because the loading is async and it requires max_frames read from the json file
			cc.resources.load('sprites/' + conf.sprite, cc.Texture2D, (err, tex) => {
				if (err) {
					cc.log(err);
				} else {
					enemyData[wave.id].texture = tex;
				}
			});
		}
		return enemyData;
	},

	loadTowers: function () {
		for (var tid of Object.keys(this.towersConfig.json)) {
			let tower = this.towersConfig.json[tid];
			for (let level of tower.levels) {
				cc.resources.load("sprites/" + level.sprite, cc.JsonAsset, (err, res) => {
					if (err) {
						cc.log(err);
					} else {
						level.frameRects = res.json.frame_rects;
						level.animations = res.json.animations;
					}
				});
				// this has to be inside because the loading is async and it requires max_frames read from the json file
				cc.resources.load('sprites/' + level.sprite, cc.Texture2D, (err, tex) => {
					if (err) {
						cc.log(err);
					} else {
						level.texture = tex;
					}
				});
			}
		}
		return this.towersConfig.json;
	},

    start () {

    },

    // update (dt) {},
});
