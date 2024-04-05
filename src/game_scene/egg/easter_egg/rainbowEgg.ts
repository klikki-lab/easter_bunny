import { Shadow } from "../shadow";
import { EasterEgg, Status, VelocityRate } from "./easterEgg";

export class RainbowEgg extends EasterEgg {

    onCracked: g.Trigger<RainbowEgg> = new g.Trigger();

    static readonly COLOR = "#ff8040";

    constructor(scene: g.Scene, shadow: Shadow) {
        super(scene, "easter_egg_rainbow", 1000, shadow, 4);
    }

    override init(x: number, y: number, targetX?: number, targetY?: number) {
        this.onFinish.add(_ => this.onCracked.fire(this));
        super.init(x, y, targetX, targetY);
    }

    override crack = (pos: g.CommonOffset, distance: number): void => {
        if (this._status !== Status.NORMAL) return;

        this._isJumping = true;
        this.stop();
        this.z = this.y;
        this._step = 0 - distance;

        this.setVelocity(pos.x, pos.y, this.x, this.y);
        this.modified();
    };

    protected override move(): void {
        this.x += this.vx;
        this.y += this.vy;
        this.modified();
    }

    protected override updateHandler = (): void => {
        if (this._isJumping) {
            if (this._step < 0) {
                this._step++;
                return;
            }

            const sin = Math.sin(Math.PI * (++this._step / EasterEgg.JUMP_FRAMES));

            const rate = 2 / g.game.fps;
            this.z += (this.vy / this._velocity) * this.height * rate;
            this.x += (this.vx / this._velocity) * this.width * rate;
            const jumpHeight = this.height * EasterEgg.BOUNCE_HEIGHT_RATE * sin;
            this.y = this.z - jumpHeight;
            this._shadow.move({ x: this.x, y: this.z, width: 0, height: this.height });

            if (this._step === EasterEgg.JUMP_FRAMES) {
                this.onBounced.fire(this);

                this.y = this.z;
                this._step = 0;
                this._isJumping = false;
                if (this._status === Status.NORMAL) {
                    this._status++;
                    this.frames = [2, 3];
                    this.interval = Math.floor(g.game.random.generate() * 200);
                    this.vx *= VelocityRate.CRACKED;
                    this.vy *= VelocityRate.CRACKED;
                    this.scaleX = this.vx < 0 ? 1 : -1;
                    this.frameNumber = 0;
                    this.loop = false;
                    this.start();
                }

                this._shadow.move(this);
            }
            this.modified();
            return;
        }

        if (this._status === Status.NORMAL) {
            this.move();
            this._shadow.move(this);
        }
        if (!this._isAppear) {
            if (this.x + this.width / 2 > 0 && this.x - this.width / 2 < g.game.width &&
                this.y + this.height / 2 > 0 && this.y - this.height / 2 < g.game.height) {
                this._isAppear = true;
            }
        } else {
            if (this.x + this.width / 2 < 0 || this.x - this.width / 2 > g.game.width ||
                this.y + this.height < 0 || this.y - this.height / 2 > g.game.height) {
                this.destroy();
            }
        }
    }
}