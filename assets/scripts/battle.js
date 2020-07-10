// a script for controlling battle

const BattleController = function (obj) {

    obj.damage = function (hit, target) {
        return hit.atk - target.defense;
    };

	return obj;
}

export default BattleController;