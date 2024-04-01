import { Egg } from "../egg";
import { Shadow } from "../shadow";

export const Status = {
    NORMAL: 0,
    CRACKED: 1,
    NAKED: 2,
} as const;

export const VelocityRate = {
    CRACKED: 1.2,
    NAKED: 1.4,
    RUN: 1.6,
} as const;

export abstract class EasterEgg extends Egg {

    static readonly SIZE = 64;
    protected static readonly JUMP_FRAMES = Math.floor(g.game.fps * 0.8);
    protected static readonly BOUNCE_HEIGHT_RATE = 2.5;

    onBounced: g.Trigger<EasterEgg> = new g.Trigger();

    protected _velocity: number = 0;
    protected _step: number = 0;
    protected _status: number = Status.NORMAL;
    protected _isTransform = false;
    protected _isAppear: boolean = false;

    constructor(
        scene: g.Scene,
        assetId: string,
        private _score: number,
        shadow: Shadow,
        velocity: number = 1.5) {

        super({
            scene: scene,
            src: scene.asset.getImageById(assetId),
            srcWidth: EasterEgg.SIZE,
            srcHeight: EasterEgg.SIZE,
            width: EasterEgg.SIZE,
            height: EasterEgg.SIZE,
            anchorX: 0.5,
            anchorY: 0.5,
            frames: [0, 1],
            interval: 300,
        }, shadow);

        this._velocity = 1 / g.game.fps * EasterEgg.SIZE * velocity;
    }

    init(x: number, y: number, targetX?: number, targetY?: number): void {
        this.x = x;
        this.y = y;

        const x2 = targetX ?? (g.game.width - this.width) / 2;
        const y2 = targetY ?? (g.game.height - this.height) / 2;
        this.setVelocity(x, y, x2, y2);
        this.modified();
        this.start();

        this._shadow.move(this);

        this.onUpdate.add(this.updateHandler);
    };

    get score(): number {
        const max = Math.min(this._status, 8);
        return this._score * Math.max(1, max * max * 4);
    }

    get isApperar(): boolean { return this._isAppear; }

    crack = (pos: g.CommonOffset, distance: number): void => {
        if (this._isTransform) {
            this.transform();
        }

        this._isJumping = true;
        this.stop();
        this.z = this.y;
        this._step = 0 - distance;

        this.setVelocity(pos.x, pos.y, this.x, this.y);
        this.modified();
    };

    collide = (bunny: g.CommonOffset): void => { this.setVelocity(bunny.x, bunny.y, this.x, this.y); };

    protected setVelocity = (x1: number, y1: number, x2: number, y2: number): void => {
        const rad = Math.atan2(y2 - y1, x2 - x1);
        this.vx = Math.cos(rad) * this._velocity;
        this.vy = Math.sin(rad) * this._velocity;
    };

    protected abstract move(): void;

    run(): void {
        this.x += this.vx;
        this.y += this.vy;
        this.modified();
    }

    isNaked = (): boolean => this._status >= Status.NAKED;

    protected updateHandler = (): void => {
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
                this._isTransform = true;
                if (this._status === Status.NORMAL) {
                    this.frames = [2, 3];
                    this.interval = Math.floor(g.game.random.generate() * 300);
                    this.vx *= VelocityRate.CRACKED;
                    this.vy *= VelocityRate.CRACKED;
                } else if (this._status === Status.CRACKED) {
                    this.frames = [6, 7];
                    this.interval = Math.floor(g.game.random.generate() * 300);
                    this.vx *= VelocityRate.NAKED;
                    this.vy *= VelocityRate.NAKED;
                } else if (this._status >= Status.NAKED) {
                    this.frames = [8, 9];
                    this.interval = Math.floor(g.game.random.generate() * 300);
                    const velocityRate = 1 + ((this._status + 1) - Status.NAKED) * .2;
                    this.vx *= VelocityRate.RUN * velocityRate;
                    this.vy *= VelocityRate.RUN * velocityRate;
                }
                this.scaleX = this.vx < 0 ? 1 : -1;
                this.frameNumber = 0;
                this.loop = false;
                this.start();

                this._shadow.move(this);
            }
            this.modified();
            return;
        }

        if (this._isTransform) {
            if (this._step++ === Math.floor(g.game.fps / 3)) {
                this.transform();
            }
            return;
        }

        if (this._status >= Status.CRACKED) {
            this.run();
        } else {
            this.move();
        }

        this._shadow.move(this);

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
        };
    };

    protected transform = () => {
        this._isTransform = false;
        this._step = 0;
        if (this._status === Status.NORMAL) {
            this.frames = [4, 5];
            this.frameNumber = 0;
            this.interval = 150;
            this.loop = true;
            this.modified();
            this.start();
        } else if (this._status >= Status.CRACKED) {
            this.frames = [8, 9];
            this.frameNumber = 0;
            this.interval = 100;
            this.loop = true;
            this.modified();
            this.start();
        }
        this._status++;
    };
}