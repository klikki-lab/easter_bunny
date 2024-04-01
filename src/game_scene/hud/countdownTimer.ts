import { FontSize } from "../../common/fontSize";

export class CountdownTimer extends g.Label {

    private static readonly SPACE = "  ";

    onStart: g.Trigger<number> = new g.Trigger();
    onTick: g.Trigger<number> = new g.Trigger();
    onFinish: g.Trigger<void> = new g.Trigger();

    constructor(scene: g.Scene, font: g.DynamicFont, private remainingSec: number) {
        super({
            scene: scene,
            text: `TIME ${remainingSec.toString()}`,
            font: font,
            fontSize: FontSize.LARGE,
            x: FontSize.LARGE,
            y: FontSize.LARGE / 2,
        });
    }

    isEnd = (): boolean => this.remainingSec <= 0;

    start = (): void => { this.onUpdate.add(this.updateHandler); };

    private spacePadding = (sec: string): string => (
        CountdownTimer.SPACE + sec).slice(-CountdownTimer.SPACE.length);

    private updateHandler = (): void => {
        if (!this.onStart.destroyed()) {
            this.onStart.fire(this.remainingSec);
            this.onStart.destroy();
        }

        this.remainingSec -= 1 / g.game.fps;
        const sec = Math.ceil(this.remainingSec);
        const text = `TIME ${this.spacePadding(sec.toString())}`;
        if (this.text !== text) {
            this.text = text;
            this.invalidate();

            if (sec > 0) {
                this.onTick.fire(sec);
            } else if (sec <= 0) {
                this.onFinish.fire();
                this.onUpdate.destroy();
            }
        }
    };
}