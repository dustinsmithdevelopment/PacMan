import * as hz from 'horizon/core';


export const MobileUIManagerEvents = {
    OnRegisterMobileUI: new hz.NetworkEvent<{ ObjectId: string, Object: hz.Entity}>('OnRegisterMobileUI'),
}

interface AssignUIAttempts {
    player: hz.Player;
    attempts: number;
}

class MobileUIManager extends hz.Component {
    static propsDefinition = {};

    private playerUIs: hz.Entity[] = [];

    private assignMobileUIIntervalId: number = -1;
    private assignMobileUIAttempts: AssignUIAttempts[] = [];
    private retryMobileUIAssignDelay: number = 0.1;
    private maxAssignAttempts: number = 5;

    preStart(): void {
        this.connectNetworkBroadcastEvent(MobileUIManagerEvents.OnRegisterMobileUI, ({ObjectId, Object}) => {
            console.log("A mobile UI manager was registered");
            if (ObjectId === "PlayerMobileUI") {
                this.playerUIs.push(Object);
                console.log(this.playerUIs.length, "mobile UIs have been registered");
            }
        });
    }

    start() {
        // When a web/mobile player enters the world, assign them a MobileUI.
        this.connectCodeBlockEvent(this.entity, hz.CodeBlockEvents.OnPlayerEnterWorld, (player: hz.Player) => {
            if (player.deviceType.get() !== hz.PlayerDeviceType.VR){
                this.assignMobileUIAttempts.push({player, attempts: 0});
                if (this.assignMobileUIIntervalId === -1){
                    this.assignMobileUIIntervalId = this.async.setInterval(() => {
                        this.assignPlayerMobileUI();
                    }, this.retryMobileUIAssignDelay * 1000);
                }
            }
        });
        // When a web/mobile player leaves the world, reassign their MobileUI to the server player.
        this.connectCodeBlockEvent(this.entity, hz.CodeBlockEvents.OnPlayerExitWorld, (player: hz.Player) => {
            if (player.deviceType.get() !== hz.PlayerDeviceType.VR){
                console.log("Player left world");
                this.unassignPlayerMobileUI(player);
            }
        });
    }

    assignPlayerMobileUI(): void {
        // Reverse iterate through the list of players without a MobileUI. We reverse iterate because we can then remove from the attempts list as we go.
        let playerAttemptIndex = this.assignMobileUIAttempts.length - 1;
        while (playerAttemptIndex >= 0) {
            const player = this.assignMobileUIAttempts[playerAttemptIndex].player;
            this.assignMobileUIAttempts[playerAttemptIndex].attempts++;
            if (this.assignMobileUIAttempts[playerAttemptIndex].attempts >= this.maxAssignAttempts) {
                console.error("Failed to assign a MobileUI to " + player.name.get() + " after " + this.maxAssignAttempts + " attempts. Giving up.");
                this.assignMobileUIAttempts.splice(playerAttemptIndex, 1);
            } else {
                const assignedMobileUI = this.attemptAssignMobileUI(player);
                if (assignedMobileUI) {
                    this.assignMobileUIAttempts.splice(playerAttemptIndex, 1);
                }
            }
            playerAttemptIndex--;
        }
        // If there are no more players without a MobileUI, clear the interval.
        if (this.assignMobileUIAttempts.length === 0){
            this.async.clearInterval(this.assignMobileUIIntervalId);
            this.assignMobileUIIntervalId = -1;
        }
    }

    // Returns true if the MobileUI was assigned successfully. Otherwise returns false and shows a warning in the console.
    attemptAssignMobileUI(player: hz.Player): boolean {
        const playerMobileUI = this.getMobileUIForPlayer(player);
        if (playerMobileUI === undefined) {
            // This could be caused by a race condition where not all the MobileUIs have been registered yet.
            // Or could just be there is not enough MobileUIs for the number of players.
            console.warn("Attempted to assign a MobileUI to " + player.name.get() + " but there was no MobileUI for this player index (Player index: "+ player.index.get() +"). Retrying...");
            console.log("Hint: Check you have enough PlayerMobileUI objects in the world.");
            return false;
        } else if(playerMobileUI.owner.get() !== this.world.getServerPlayer()){
            console.error("Attempted to assign a MobileUI to " + player.name.get() + " but it is already assigned to " + playerMobileUI.owner.get().name.get() + ". Error with player.index.");
            // Returning true here will cause the MobileUI to be re-assigned to the newer player.
            return false;
        } else {
            console.log("Found a MobileUI for " + player.name.get() + " (Player index: "+ player.index.get() + ")");
            playerMobileUI.owner.set(player);
            return true;
        }
    }

    getMobileUIForPlayer(player: hz.Player): hz.Entity | undefined {
        const playerIndex = player.index.get();
        if (playerIndex < this.playerUIs.length){
            return this.playerUIs[playerIndex];
        } else {
            return undefined;
        }
    }

    unassignPlayerMobileUI(player: hz.Player): void {
        this.playerUIs[player.index.get()].owner.set(this.world.getServerPlayer());
    }
}
hz.Component.register(MobileUIManager);
