import {
    AttachableEntity,
    Component,
    Entity,
    Player,
    PlayerVisibilityMode,
    SerializableState,
    SpawnPointGizmo,
    Vec3
} from "horizon/core";
import {anchorBodyPart, Events, GAME_SCALE} from "./GameUtilities";

export abstract class PlayerRole extends Component {
    protected attachedPlayer: Player|null = null;
    private homePosition: Vec3| undefined;
    private role = "";

    preStart() {
        super.preStart();
        this.connectNetworkEvent(this.entity, Events.assignPlayer, (data: {player: Player})=>{this.assignToPlayer(data.player)});
        this.connectNetworkEvent(this.entity, Events.unassignPlayer, (data: {player: Player})=>{this.removeFromPlayer(data.player)});
        // this.connectNetworkEvent(this.entity, Events.moveToStart, this.moveToStart.bind(this));
    }
    protected setRole(role: string){
        this.role = role;
    }

    protected SetHomePosition(position: Vec3): void {
        this.homePosition = position;
    }
    protected moveToStart(){
        console.log("Trying to move", this.role, "to start.")
        if (this.attachedPlayer && this.homePosition){
            this.attachedPlayer!.avatarScale.set(GAME_SCALE);
            if(!this.attachedPlayer.name.get().startsWith("NPC"))
                this.attachedPlayer!.position.set(this.homePosition);
        } else this.async.setTimeout(this.moveToStart.bind(this), 100);


    }
    private assignToPlayer(player: Player) {
        this.entity.owner.set(player);
        this.attachedPlayer = player;
        this.entity.as(AttachableEntity).attachToPlayer(player, anchorBodyPart);
        this.entity.setVisibilityForPlayers([player], PlayerVisibilityMode.HiddenFrom);
        this.world.ui.showPopupForPlayer(player, "You are " + this.role, 5);
        this.moveToStart();
    }
    private removeFromPlayer(player: Player) {
        this.entity.as(AttachableEntity).detach();
        this.attachedPlayer = null;
        this.entity.setVisibilityForPlayers([player], PlayerVisibilityMode.VisibleTo);
        this.entity.owner.set(this.world.getServerPlayer());
        this.entity.position.set(new Vec3(0,1000, 0));
    }
    protected getAttachedPlayer(): Player | null {
        return this.attachedPlayer ?? null;
    }
    transferOwnership(_oldOwner: Player, _newOwner: Player): SerializableState {
        if (_oldOwner !== this.world.getServerPlayer()) {
            this.sendNetworkEvent(_oldOwner, Events.showLobbyUI, {});
        }
        if (_newOwner !== this.world.getServerPlayer()) {
            this.sendNetworkEvent(_newOwner, Events.hideLobbyUI, {});
        }
        return {
            homePosition: this.homePosition!,
    }
    }
    receiveOwnership( state: {
            homePosition: Vec3}, _oldOwner: Player, _newOwner: Player) {
        this.homePosition = state?.homePosition;
        this.attachedPlayer = _newOwner;
    }

}