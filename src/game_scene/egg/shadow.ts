import { CommonOffset } from "@akashic/akashic-engine";

export class Shadow extends g.Sprite {

    constructor(scene: g.Scene, parent: g.E | g.Scene) {
        super({
            scene: scene,
            parent: parent,
            src: scene.asset.getImageById("img_shadow"),
            anchorX: 0.5,
            anchorY: 0.5,
            opacity: 0.33,
        });
    }

    move = (e: g.CommonArea): void => {
        this.x = e.x;
        this.y = e.y + e.height / 2;
        this.modified();
    }

    override destroy(destroySurface?: boolean): void {
        if (!this.destroyed()) {
            super.destroy(destroySurface);
        }
    }
}