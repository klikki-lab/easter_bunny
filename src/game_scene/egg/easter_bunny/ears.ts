export class Ears extends g.FrameSprite {

    constructor(scene: g.Scene, private _interval: number) {
        super({
            scene: scene,
            src: scene.asset.getImageById("easter_bunny_ears"),
            srcWidth: 96,
            srcHeight: 64,
            width: 96,
            height: 64,
            anchorX: 0.5,
            anchorY: 0.5,
            frames: [1, 0],
            interval: _interval,
        });
    }

    startNormalAnimation = () => {
        this.frames = [1, 0];
        this.frameNumber = 0;
        this.loop = true;
        this.interval = this._interval;
        this.modified();
        this.start();
    };

    startPowerUpAnimation = () => {
        this.frames = [4, 3];
        this.frameNumber = 0;
        this.loop = true;
        this.interval = this._interval;
        this.modified();
        this.start();
    };

    jumping = (isPowerUp: boolean) => {
        this.frames = isPowerUp ? [4] : [1];
        this.frameNumber = 0;
        this.loop = false;
        this.modified();
    };

    falling = (isPowerUp: boolean) => {
        this.frames = isPowerUp ? [3, 5] : [0, 2];
        this.frameNumber = 0;
        this.loop = false;
        this.interval = Math.floor(1000 / g.game.fps) * 2;
        this.modified();
        this.start();
    };

    ground = (isPowerUp: boolean) => {
        this.frames = isPowerUp ? [4] : [1];
        this.frameNumber = 0;
        this.loop = false;
        this.modified();
    }
}