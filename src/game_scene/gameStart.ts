export class GameStart extends g.Label {

    onFinish: g.Trigger<void> = new g.Trigger();

    constructor(scene: g.Scene, font: g.DynamicFont, remainingSec: number = 2) {
        super({
            scene: scene,
            text: "スタート!",
            font: font,
            fontSize: font.size,
            anchorX: 0.5,
            anchorY: 0.5,
            x: g.game.width / 2,
            y: -font.size,
        });

        let vy = this.height / 10;
        let isWaiting: boolean = false;

        this.onUpdate.add(() => {
            if (!isWaiting) {
                if (this.y < g.game.height / 2) {
                    this.y += vy;
                    vy *= 1.5;
                    if (this.y >= g.game.height / 2) {
                        isWaiting = true;
                        this.y = g.game.height / 2;
                        vy = this.height / 10;
                    }
                    this.modified();
                }
            } else {
                remainingSec -= 1 / g.game.fps;
                if (remainingSec < 0) {
                    this.y -= vy;
                    vy *= 1.5;
                    this.modified();
                    if (this.y + this.height < 0) {
                        this.onFinish.fire();
                        this.destroy();
                    }
                }
            }
        });
    }
}