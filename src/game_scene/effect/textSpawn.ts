import { FontSize } from "../../common/fontSize";

export class TextSpawn extends g.Label {

    constructor(scene: g.Scene, font: g.DynamicFont, text: string, pos: g.CommonOffset) {
        super({
            scene: scene,
            text: text,
            font: font,
            fontSize: font.size,
            anchorX: 0.5,
            anchorY: 0.5,
            x: pos.x,
            y: pos.y,
        });

        const fps = Math.floor(g.game.fps * .75);
        const vy = this.height * .5;
        let y = 0;
        let frame = 0;
        this.onUpdate.add(_ => {
            if (frame / fps <= 0.5) {
                const sin = 1 - Math.sin(Math.PI * (frame / fps));
                y += vy * sin;
            }
            this.x = pos.x;
            this.y = pos.y - y;
            this.modified();

            if (frame >= fps * 2) {
                this.destroy();
            }
            frame++;
        });
    }
}