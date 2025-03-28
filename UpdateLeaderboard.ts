import {CodeBlockEvent, Component, Player, PropTypes} from "horizon/core";

const variableName = "Runks Variable Group:LifeTimeDarts"
const leaderBoardName = "darts";

const updateEvent = new CodeBlockEvent<[player: Player, points: number]>("updateScore", [PropTypes.Player, PropTypes.Number]);

class updateLeaderboard extends Component {
    static propsDefinition = {    };
    preStart() {

    }

    start() {
        this.connectCodeBlockEvent(this.entity, updateEvent, (player: Player, points: number)=>{
            const persistentVariables = this.world.persistentStorage;
            const currentScore = persistentVariables.getPlayerVariable(player, variableName);
            console.log(player.name.get(), " currently has a score of ", currentScore);
            const newScore = currentScore + points;
            console.log(player.name.get(), " should have a new score of ", newScore);
            persistentVariables.setPlayerVariable(player, variableName , newScore);
            this.world.leaderboards.setScoreForPlayer(leaderBoardName,player, newScore, true);
        })
    }

}
Component.register(updateLeaderboard);