import {
    AttachableEntity,
    Component,
    Entity,
    Player,
    SerializableState,
    SpawnPointGizmo,
} from "horizon/core";
import {anchorBodyPart, Events, GAME_SCALE} from "./GameUtilities";

export abstract class PlayerRole extends Component {
    protected attachedPlayer: Player|null = null;
    private homePosition: SpawnPointGizmo|undefined;
    private role = "";

    preStart() {
        super.preStart();
    }
    protected setRole(role: string){
        this.role = role;
    }

    protected SetHomePosition(position: Entity): void {
        this.homePosition = position.as(SpawnPointGizmo);
    }
    protected moveToStart(){
        // console.log("Trying to move", this.role, "to start.")
        if (this.attachedPlayer && this.homePosition){
            this.attachedPlayer!.avatarScale.set(GAME_SCALE);
            // if(!this.attachedPlayer.name.get().startsWith("NPC")) {
            //     console.log("Command sent to send", this.role, "to start for", this.attachedPlayer.name.get());
                this.homePosition.teleportPlayer(this.attachedPlayer);
            }


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
        this.entity.as(AttachableEntity).detach();
        this.attachedPlayer = null;
        return {
            homePosition: this.homePosition!.as(Entity),
    }
    }
    receiveOwnership( state: { homePosition: Entity}, _oldOwner: Player, _newOwner: Player) {
        this.homePosition = state?.homePosition.as(SpawnPointGizmo);
        if (_newOwner !== this.world.getServerPlayer()) {
            this.attachedPlayer = _newOwner;
            this.entity.as(AttachableEntity).attachToPlayer(_newOwner, anchorBodyPart);
            this.world.ui.showPopupForPlayer(_newOwner, "You are " + this.role, 5);
            this.async.setTimeout(this.moveToStart.bind(this), 100);
        }

    }

}