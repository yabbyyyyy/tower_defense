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
		level.getComponent("level").configure(this.levelsConfig.json[level.name], this.enemiesConfig.json, this.towersConfig.json);
		level.parent = this.node;
	},

	showDamage: function (damage, position) {

	},

    start () {

    },

    // update (dt) {},
});
