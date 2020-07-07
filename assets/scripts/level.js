// level script
import global from './global'
const BaseState = {
	Invalid: -1,
	Empty: 0,
	BuiltTower: 1,
	Menu: 21,
	UpgradeMenu: 22,
};

cc.Class({
    extends: cc.Component,

    properties: {
		enemyRouteNodes: {
			default: [],
			type: cc.Node
		},
		towerBaseNodes: {
			default: [],
			type: cc.Node
		},
		towerPrefabs: {
			default: [],
			type: cc.Prefab
		},
		buildMenuPrefab: {
			default: null,
			type: cc.Prefab
		},
		upgradeMenuPrefab: {
			default: null,
			type: cc.Prefab
		},
		enemyPrefab: {
			default: null,
			type: cc.Prefab
		},
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
		// set touch event for each tower base
		for (var node of this.towerBaseNodes) {
			this.setState(node, BaseState.Empty);
			this.setTouchEvent(node);
		}
		// console.log(this.towerBaseNodes.length);
		global.event.register("build_tower", this.buildTower.bind(this));
		global.event.register("sell_tower", this.sellTower.bind(this));
		global.event.register("upgrade_tower", this.upgradeTower.bind(this));
		global.event.register("level_start", this.levelStart.bind(this));
		global.event.register("enemy_goal", this.enemyGoal.bind(this));
	},
	
	configure: function (levelConf, enemyConf, towerConf) {
		this.life = levelConf.life;
		this.wavesData = levelConf.waves;
		this.enemiesData = enemyConf;
		this.towersData = towerConf;
		this.enemiesList = [];
	},

	setTouchEvent: function (node) {
		node.on(cc.Node.EventType.TOUCH_START, (event) => {
			// check state and call the corresponding menu
			switch (node.state) {
			case BaseState.Empty:
				this.showMenu(node, this.buildMenuPrefab);
				break;
			case BaseState.BuiltTower:
				this.showMenu(node, this.upgradeMenuPrefab);
				break;
			default:
				break;
			}
		})
	},

	showMenu: function (node, prefab) {
		this.closeMenu();
		if (node.state == BaseState.Menu) {
			return;
		}
		
		let menu = cc.instantiate(prefab);
		menu.parent = this.node;
		menu.position = node.position;
		this.setState(node, BaseState.Menu);
		node.menu = menu;
	},
	
	closeMenu: function () {
		for (var node of this.towerBaseNodes) {
			if (node.state == BaseState.Menu) {
				node.menu.destroy();
				node.state = node.prevState;
				return node;
			}
		}
	},
	
	setState: function (node, state) {
		if (node.state == state) {
			return;
		}
		
		switch (state) {
		case BaseState.Invalid:
			break;
		default:
			break;
		}
		
		// save previous state
		node.prevState = node.state;
		node.state = state;
	},
	
	buildTower: function (data) {
		// cc.log("build tower " + data);
		let node = this.closeMenu();
		// use single type for now
		let tower = cc.instantiate(this.towerPrefabs[0]);
		// cc.log(data + ", " + JSON.stringify(this.towersData[data]));
		tower.getComponent("tower").configure(this.towersData[data], node.position);
		tower.parent = this.node;
		
		this.setState(node, BaseState.BuiltTower);
		node.tower = tower;
	},
	
	sellTower: function () {
		let node = this.closeMenu();
		node.tower.destroy();
		node.tower = undefined;
		this.setState(node, BaseState.Empty);
	},
	
	upgradeTower: function () {
		let node = this.closeMenu();
		node.tower.getComponent("tower").upgrade();
	},
	
	onDestroy: function () {
		global.event.remove("build_tower", this.buildTower.bind(this));
		global.event.remove("sell_tower", this.sellTower.bind(this));
		global.event.remove("upgrade_tower", this.upgradeTower.bind(this));
		global.event.remove("level_start", this.levelStart.bind(this));
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
		this.waveTimer = 0;
		if (this.enemyCount < this.currWave.count) {
			let enemy = cc.instantiate(this.enemyPrefab);
			// initialize enemy
			let enemyData = this.enemiesData[this.currWave.id];
			let nid = this.enemiesList.length;
			enemy.getComponent("enemy").configure(nid, enemyData, this.enemyRouteNodes);
			enemy.parent = this.node;
			this.enemiesList.push(enemy);
			global.event.register("enemy" + nid, (nid) => { this.enemiesList[nid] = undefined; });
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
		cc.log(this.life);
	},
	
	update: function (dt) {
		if (this.currWave) {
			this.waveTimer += dt;
			let newEnemy = ((this.enemyCount == 0) && (this.waveTimer > this.currWave.wait)) ||
						   ((this.enemyCount > 0) && (this.waveTimer >= this.currWave.interval));
			if (newEnemy) {
				this.addEnemy();
				// cc.log("Wave " + this.wave + ", Enemy " + this.enemyCount + ": " + JSON.stringify(this.enemiesData[this.currWave.id]));
			}
		}
		
		// search enemy
		for (var base of this.towerBaseNodes) {
			let tower = base.tower;
			// built tower
			// TODO: use bitwise flag to separate different states
			if (!!tower) {
				tower.getComponent("tower").searchEnemy(this.enemiesList);
			}
		}
	},
	
    start () {

    },

    // update (dt) {},
});
