import EventListener from './event_listener'
import BattleController from './battle'

const global = global || {};
global.event = EventListener({});
global.battle = BattleController({});

export default global;