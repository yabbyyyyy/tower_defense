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

		level.getComponent("level").configure(levelData, enemyData, this.towersConfig.json);
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
			cc.resources.load("animations/" + conf.animation, cc.JsonAsset, (err, res) => {
				if (err) {
					cc.log(err);
					return;
				}
				cc.log(res.json.max_frames);
				enemyData[wave.id].animations = res.json.animations;
				// load frames
				let frames = [];
				// this has to be inside because the loading is async and it requires max_frames read from the json file
				for (let i = 0; i < res.json.max_frames; ++i) {
					cc.resources.load('sprites/' + conf.sprite + "-" + i, cc.SpriteFrame, (err, frame) => {
						if (err) {
							cc.log(err);
						} else {
							frames.push(frame);
						}
					});
				}
				enemyData[wave.id].frames = frames;
			});
		}
		return enemyData;
	},

    start () {

    },

    // update (dt) {},
});
