// tower base script
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
		buildMenuPrefab: {
			default: null,
			type: cc.Prefab
		},
		upgradeMenuPrefab: {
			default: null,
			type: cc.Prefab
		},
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        this.state = BaseState.Empty;
        this.node.on(cc.Node.EventType.TOUCH_START, (event) => {
			// do not pass it to parent nodes
			event.stopPropagation();
			// check state and call the corresponding menu
			switch (this.state) {
			case BaseState.Empty:
				this.showMenu(this.buildMenuPrefab);
				break;
			case BaseState.BuiltTower:
				this.showMenu(this.upgradeMenuPrefab);
				break;
			default:
				break;
			}
		})
    },

	showMenu: function (prefab) {
		this.levelScript.closeMenu();
		if (this.state == BaseState.Menu) {
			return;
		}
        let menu = cc.instantiate(prefab);
		menu.scale = 0.;
		menu.position = this.node.position;
		menu.parent = this.levelScript.node;
		cc.tween(menu).to(0.1, {scale: 0.6}).start();

        menu.target = this;
		this.setState(BaseState.Menu);
        this.menu = menu;
    },
    
    closeMenu: function () {
        if (this.state == BaseState.Menu) {
            this.menu.destroy();
            this.state = this.prevState;
        }
    },

	setState: function (state) {
		if (this.state == state) {
			return;
		}
		
		switch (state) {
		case BaseState.Invalid:
			break;
		default:
			break;
		}
		
		// save previous state
		this.prevState = this.state;
		this.state = state;
    },
    
	buildTower: function (data) {
		// cc.log("build tower " + data);
		this.levelScript.closeMenu();
		// use single type for now
		let tower = cc.instantiate(this.levelScript.towerPrefab);
        // cc.log(data + ", " + JSON.stringify(this.towersData[data]));
		let towerScript = tower.getComponent("tower");
        towerScript.configure(this.levelScript.towersData[data], this.node.position);
		tower.parent = this.levelScript.node;
		
		this.setState(BaseState.BuiltTower);
		this.tower = towerScript;
	},
	
	sellTower: function () {
		this.levelScript.closeMenu();
		this.tower.node.destroy();
		this.tower = undefined;
		this.setState(BaseState.Empty);
	},
	
	upgradeTower: function () {
        this.levelScript.closeMenu();
		this.tower.upgrade();
    },
    
    start () {

    },

    // update (dt) {},
});
