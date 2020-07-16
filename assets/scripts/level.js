// level script
import global from './global'

const resColors = ['#FFD700', '#228CFF'];

cc.Class({
    extends: cc.Component,

    properties: {
		towerPrefab: {
			default: null,
			type: cc.Prefab
		},
		enemyPrefab: {
			default: null,
			type: cc.Prefab
		},
		baseMenuPrefab: {
			default: null,
			type: cc.Prefab
		},
		towerMenuPrefab: {
			default: null,
			type: cc.Prefab
		},
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
		this.bases = this.node.getChildByName("bases").getChildren();
		this.routes = this.node.getChildByName("routes").getChildren();
		// pass this script to the base
		for (var base of this.bases) {
			base.getComponent("base").levelScript = this;
			base.opacity = 0;
		}
		for (var route of this.routes) {
			route.active = false;
		}
		global.event.register("level_start", this.levelStart.bind(this));
		global.event.register("enemy_goal", this.enemyGoal.bind(this));
		global.battle.level = this;
		this.node.on(cc.Node.EventType.TOUCH_START, (event) => { this.closeMenu(); });
	},
	
	configure: function (levelConf, enemyConf, towerConf) {
		this.life = levelConf.life;
		global.resources.set(levelConf.resources);
		this.wavesData = levelConf.waves;
		this.enemiesData = enemyConf;
		this.towersData = towerConf;
		this.enemiesList = [];

		// setup menus
		this.baseMenu = cc.instantiate(this.baseMenuPrefab);
		this.baseMenu.buildButtons = this.baseMenu.getChildByName("buttons").getChildren();
		for (let button of this.baseMenu.buildButtons) {
			if (towerConf.hasOwnProperty(button.name)) {
				let tower = towerConf[button.name];
				button.active = true;
				let labels = [
					button.getChildByName("gold").getComponent(cc.Label),
					button.getChildByName("crystal").getComponent(cc.Label),
				];
				let cost = tower.levels[0].cost;
				for (let i = 0; i < cost.length; ++i) {
					labels[i].node.active = true;
					labels[i].string = cost[i];
					labels[i].node.color = labels[i].node.color.fromHEX(resColors[i]);
					if (cost[i] == 0) {
						labels[i].node.active = false;
					}
				}
				// move up 50 for the space of crsytal resource label
				if (labels[1].node.active) {
					labels[0].node.position = labels[0].node.position.add(cc.v2(0, 50));
				}
			} else {
				button.active = false;
			}
		}
		this.baseMenu.active = false;
		this.baseMenu.parent = this.node;

		this.towerMenu = cc.instantiate(this.towerMenuPrefab);
		this.towerMenu.active = false;
		this.towerMenu.parent = this.node;
	},
	
	onDestroy: function () {
		global.event.clear();
	},
	
	levelStart: function() {
		this.wave = 0;
		this.waveTimer = 0;
		this.enemyCount = 0;
		// cc.log(JSON.stringify(this.wavesData));
		// cc.log(JSON.stringify(this.enemiesData));
		this.currWave = this.wavesData[this.wave];
	},
	
	addEnemy: function () {
		if (this.enemyCount < this.currWave.count) {
			let enemy = cc.instantiate(this.enemyPrefab);
			let enemyData = this.enemiesData[this.currWave.id];
			let enemyScript = enemy.getComponent("enemy");

			// register enemy with an ID
			let nid = this.enemiesList.length;
			enemyScript.configure(this.wave, nid, enemyData, this.routes);

			// add an event for removing this enemy
			this.enemiesList.push(enemyScript);
			global.event.register("enemy" + nid, (nid) => { this.enemiesList[nid] = undefined; });
			// increment of count
			enemy.parent = this.node;
			this.enemyCount++;
		} else {
			this.wave++;
			this.enemyCount = 0;
			// check for end of waves
			if (this.wave < this.wavesData.length) {
				this.currWave = this.wavesData[this.wave];
			} else {
				this.currWave = undefined;	
			}
		}
	},
	
	enemyGoal: function () {
		this.life--;
		cc.log("Life left: " + this.life);
	},

	enemyDestroy: function (reward, wave, nid, pos) {
		this.enemiesList[nid] = undefined;
		global.event.trigger("null_target" + nid);
		global.event.off("null_target" + nid);

		if (reward) {
			let waveData = this.wavesData[wave];
			global.resources.add(waveData.reward, true, pos);
		}
	},
	
	update: function (dt) {
		if (this.currWave) {
			this.waveTimer += dt;
			let newEnemy = ((this.enemyCount == 0) && (this.waveTimer > this.currWave.wait)) ||
						   ((this.enemyCount > 0) && (this.waveTimer >= this.currWave.interval));
			if (newEnemy) {
				this.waveTimer = 0;
				this.addEnemy();
				// cc.log("Wave " + this.wave + ", Enemy " + this.enemyCount + ": " + JSON.stringify(this.enemiesData[this.currWave.id]));
			}
		}
		
		// search enemy
		for (var base of this.bases) {
			let tower = base.getComponent("base").tower;
			// built tower
			// TODO: use bitwise flag to separate different states
			if (tower != undefined) {
				tower.searchEnemy(this.enemiesList);
			}
		}
	},
	
	// menus
	callBaseMenu: function (base) {
		this.closeMenu();
		this.baseMenu.target = base;
		// grey out and disable
		for (let button of this.baseMenu.buildButtons) {
			let buttonComp = button.getComponent(cc.Button);
			buttonComp.interactable = true;
			let labels = [
				button.getChildByName("gold").getComponent(cc.Label),
				button.getChildByName("crystal").getComponent(cc.Label)
			];
			let res = global.resources.get();
			for (let i = 0; i < labels.length; ++i) {
				if (res[i] < labels[i].string) {
					labels[i].node.color = labels[i].node.color.fromHEX('#990000');;
					buttonComp.interactable = false;
				}
			}
		}
		this.popMenu(this.baseMenu, base.node.position);
	},

	callTowerMenu: function (base, tower) {
		this.closeMenu();
		this.towerMenu.target = base;
		this.popMenu(this.towerMenu, base.node.position);
	},

	popMenu: function (menu, pos) {
		menu.controller = this;
		menu.scale = 0.;
		menu.position = pos;
		menu.active = true;
		cc.tween(menu).to(0.1, {scale: 0.6}).start();
	},

    closeMenu: function () {
		this.baseMenu.active = false;
		this.towerMenu.active = false;
	},

    start () {

    },

    // update (dt) {},
});
