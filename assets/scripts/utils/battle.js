// a script for controlling battle

const BattleController = function (obj) {

    obj.game = undefined;
    obj.level = undefined;
    obj.ui = undefined;

    obj.atk_interval = function (aspd) {
        return 1./aspd;
    };

    obj.damage = function (hit, target, pos = cc.v2(0, 0)) {
        if (!this.level) {
            console.log('Error: no battle field!');
            return;
        }
        // aoe damage
        if (hit.aoe_range > 0) {
            for (var enemy of this.level.enemiesList) {
                if (!enemy) { continue; }
                let dist = pos.sub(enemy.node.position).mag();
                if (dist < hit.aoe_range/4.) {
                    this.attackOn(hit, enemy);
                } else if (dist < hit.aoe_range/2.) {
                    this.attackOn(hit, enemy, 0.75);
                } else if (dist < hit.aoe_range) {
                    this.attackOn(hit, enemy, 0.50);
                }
            }
        // single target damage (locked target)
        } else if (hit.lock) {
            this.attackOn(hit, target);
        // not locking
        } else {
            for (var enemy of this.level.enemiesList) {
                if (!enemy) { continue; }
                let dist = pos.sub(enemy.node.position).mag();
                // default collision range
                if (dist < 5.) {
                    this.attackOn(hit, enemy);
                    // single target
                    return;
                }
            }
        }
    };

    obj.attackOn = function (hit, target, mod = 1.0) {
        if (target) {
            let damage = hit.atk - target.prop.defense;
            let crit = (hit.crit > 0.) && (Math.random()*100. < hit.crit);
            if (crit) {
                damage *= (1. + hit.crit_mod/100.);
            }
            target.damage(damage*mod, hit.recover*mod);
            // show damage on UI layer
            let damageNum = Math.round(damage);
            if ((damageNum > 0) && (obj.ui)) {
                this.ui.popDamage(damageNum, target.node.position.add(cc.v2(0, 50)), 0.5, crit);
            }
        }
    }

	return obj;
}

export default BattleController;