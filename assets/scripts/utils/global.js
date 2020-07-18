import EventListener from './event_listener'
import BattleController from './battle'
import Messenger from './messages'

const global = global || {};
global.event = EventListener({});
global.battle = BattleController({});
global.messages = Messenger;

export default global;