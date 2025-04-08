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
    private spawnPointGizmo: SpawnPointGizmo| undefined;
    private role = "";

    preStart() {
        super.preStart();
        this.connectNetworkEvent(this.entity, Events.assignPlayer, (data: {player: Player})=>{this.assignToPlayer(data.player)});
        this.connectNetworkEvent(this.entity, Events.unassignPlayer, (data: {player: Player})=>{this.removeFromPlayer(data.player)});
        this.connectNetworkBroadcastEvent(Events.moveAllToStart, this.moveToStart.bind(this));
    }
    protected setRole(role: string){
        this.role = role;
    }

    protected SetSpawnPoint(spawnEntity: Entity): void {
        this.spawnPointGizmo = spawnEntity.as(SpawnPointGizmo);
    }
    protected moveToStart(){
        if (this.attachedPlayer){
            console.log("Move To Start", this.spawnPointGizmo, this.attachedPlayer?.name.get());
            // TODO find out why this breaks everything
            this.attachedPlayer!.avatarScale.set(GAME_SCALE);
            this.async.setTimeout(()=>{this.spawnPointGizmo!.teleportPlayer(this.attachedPlayer!);},200);
            console.log("All the stuff should have happened on", this.attachedPlayer!.name.get(), "as the", this.role);
        } else this.async.setTimeout(this.moveToStart.bind(this), 100);


    }
    private assignToPlayer(player: Player) {
        this.entity.owner.set(player);
        console.log("Assigning Player", player, "to", this.role);
        this.attachedPlayer = player;
        this.entity.as(AttachableEntity).attachToPlayer(player, anchorBodyPart);
        this.entity.setVisibilityForPlayers([player], PlayerVisibilityMode.HiddenFrom);
        this.world.ui.showPopupForPlayer(player, "You are " + this.role, 5);
    }
    private removeFromPlayer(player: Player) {
        this.entity.as(AttachableEntity).detach();
        this.attachedPlayer = null;
        this.entity.setVisibilityForPlayers([player], PlayerVisibilityMode.VisibleTo);
        this.entity.owner.set(this.world.getServerPlayer());
    }
    protected getAttachedPlayer(): Player | null {
        return this.attachedPlayer ?? null;
    }
    transferOwnership(_oldOwner: Player, _newOwner: Player): SerializableState {
        return {
            attachedPlayer: this.attachedPlayer,
            spawnPointGizmo: this.spawnPointGizmo!.as(Entity)};
    }
    receiveOwnership( state: {
        attachedPlayer: Player,
        spawnPointGizmo: SpawnPointGizmo}, _oldOwner: Player, _newOwner: Player) {
        this.spawnPointGizmo = state?.spawnPointGizmo.as(SpawnPointGizmo);
    }

}