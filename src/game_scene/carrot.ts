import { Shadow } from "./egg/shadow";

export class Carrot extends g.Sprite {

    private static readonly SCORE = 1000;

    constructor(scene: g.Scene, pos: g.CommonOffset, private _shadow: Shadow, private _score: number = Carrot.SCORE) {
        super({
            scene: scene,
            src: scene.asset.getImageById("img_carrot"),
            x: pos.x,
            y: pos.y,
            anchorX: .5,
            anchorY: .5,
        });
    }

    override destroy(destroySurface?: boolean): void {
        this._shadow.destroy(destroySurface);
        if (!this.destroyed()) {
            super.destroy(destroySurface);
        }
    }

    get score(): number { return this._score; }
}