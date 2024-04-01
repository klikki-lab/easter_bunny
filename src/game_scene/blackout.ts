export class Blackout extends g.FilledRect {

    constructor(scene: g.Scene, parent?: g.E | g.Scene) {
        super({
            scene: scene,
            parent: parent,
            width: g.game.width,
            height: g.game.height,
            cssColor: "black",
        });
    }

    open = () => {
        this.opacity = 0.5;
        this.modified();
        this.onUpdate.add(this.openHandler);
    };

    private openHandler = () => {
        this.opacity -= (1 / g.game.fps) * 3;
        if (this.opacity <= 0) {
            this.opacity = 0;
            this.onUpdate.remove(this.openHandler);
        }
        this.modified();
    };

    close = () => {
        this.opacity = 0;
        this.modified();
        this.onUpdate.add(this.closeHandler);
    };

    private closeHandler = () => {
        this.opacity += (1 / g.game.fps) * 3;
        if (this.opacity >= 0.5) {
            this.opacity = 0.5;
            this.onUpdate.remove(this.closeHandler);
        }
        this.modified();
    };
}