// a script for controlling battle

const BattleController = function (obj) {

    obj.field = undefined;
    obj.uiLayer = undefined;

    obj.atk_interval = function (aspd) {
        return 1./aspd;
    };

    obj.damage = function (hit, target) {
        let damage = hit.atk - target.defense;
        let crit = (hit.crit > 0.) && (Math.random()*100. < hit.crit);
        if (crit) {
            damage *= (1. + hit.crit_mod/100.);
        }
        // show damage on UI layer
        let damageNum = Math.round(damage);
        if ((damageNum > 0) && (obj.uiLayer)) {
            obj.uiLayer.showDamage(damageNum, target.node.position.add(cc.v2(0, 50)), 1.0, crit);
        }
        return damage;
    };

	return obj;
}

export default BattleController;