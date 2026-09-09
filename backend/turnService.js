import {GameCore} from '../core/gameCore.js';
import {contextFor,resolvePlan,resolveChoice} from '../core/gameMaster.js';
import {rememberTurn} from '../core/campaign.js';
export async function runTurn({state,input,data,ai,choiceId,travelId}){
 const core=new GameCore(data);core.load(JSON.stringify(state));
 const result=choiceId||travelId?resolveChoice(core,{choiceId,travelId,input}):resolvePlan(core,input,await ai.interpret(input,contextFor(core)));
 const narrative=(choiceId||travelId)?result.narrative:await ai.narrate(input,contextFor(core),result);
 core.state.gameMaster=true;rememberTurn(core,input,narrative,result);return core.state;
}
