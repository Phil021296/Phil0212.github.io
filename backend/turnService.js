import {GameCore} from '../core/gameCore.js';
import {contextFor,resolvePlan} from '../core/gameMaster.js';
export async function runTurn({state,input,data,ai}){
 const core=new GameCore(data);core.load(JSON.stringify(state));
 const plan=await ai.interpret(input,contextFor(core));
 const result=resolvePlan(core,input,plan);
 // A failed narrator aborts the entire turn; callers never persist a half turn.
 const narrative=await ai.narrate(input,contextFor(core),result);
 core.state.lastNarrative=narrative;core.state.lastResolution=result;
 return core.state;
}
