import { Floor } from "../game_scene/floor";

export class CustomLoadingScene extends g.LoadingScene {

    constructor() {
        super({ game: g.game, });

        this.append(new Floor(this));
    }
}