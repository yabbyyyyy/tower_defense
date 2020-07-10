// a script for controlling battle

const BattleController = function (obj) {

    obj.atk_interval = function (aspd) {
        return 1./aspd;
    };

    obj.damage = function (hit, target) {
        let damage = hit.atk - target.defense;
        if ((hit.crit > 0.) && (Math.random()*100. < hit.crit)) {
            damage *= (1. + hit.crit_mod/100.);
        }
        return damage;
    };

	return obj;
}

export default BattleController;