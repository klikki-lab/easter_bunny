import { FontSize } from "../common/fontSize";

export class StartTimer extends g.Label {

    onTick: g.Trigger<number> = new g.Trigger();
    onFinish: g.Trigger<void> = new g.Trigger();

    constructor(scene: g.Scene, font: g.DynamicFont, private remainingSec: number) {
        super({
            scene: scene,
            text: `あと ${remainingSec.toString()} 秒でゲームスタート！`,
            font: font,
            fontSize: font.size,
            anchorX: 0.5,
            anchorY: 0.5,
        });
    }

    start = () => { this.onUpdate.add(this.updateHandler); };

    private updateHandler = (): void | boolean => {
        this.remainingSec -= 1 / g.game.fps;
        const sec = Math.ceil(this.remainingSec);
        const text = `あと ${sec.toString()} 秒でゲームスタート！`;
        if (this.text !== text) {
            this.text = text;
            this.invalidate();

            if (sec > 0) {
                this.onTick.fire(sec);
            } else if (sec < 0) {
                this.onFinish.fire();
                return true;
            }
        }
    };
}