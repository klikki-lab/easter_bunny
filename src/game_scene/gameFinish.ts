export class GameFinish extends g.Label {

    onFinish: g.Trigger<void> = new g.Trigger();

    constructor(scene: g.Scene, font: g.DynamicFont, remainingSec: number = 2) {
        super({
            scene: scene,
            text: "おしまい",
            font: font,
            fontSize: font.size,
            anchorX: 0.5,
            anchorY: 0.5,
            x: g.game.width / 2,
            y: -font.size,
        });

        const gravity = 0.98;
        let vy = font.size * .25;

        this.onUpdate.add(() => {
            this.y += vy;
            vy += gravity;
            if (this.y >= g.game.height / 2) {
                this.y = g.game.height / 2;
                vy = -vy * .5;
                if (Math.abs(vy) < font.size * .05) {
                    return true;
                }
            }
            this.modified();
        });
    }
}