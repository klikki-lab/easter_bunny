import { Egg } from "../egg";
import { Ears } from "./ears";
import { Shadow } from "../shadow";

const AnimFrames = {
    NORMAL: [1, 0] as number[],
    JUMPING: [0] as number[],
    GROUND: [2] as number[],
    POWER_UP: [3, 4] as number[],
    POWER_UP_JUMPING: [4] as number[],
    POWER_UP_GROUND: [4] as number[],
} as const;

const Direction = {
    LEFT: 1,
    RIGHT: -1,
} as const;

export class EasterBunny extends Egg {

    private static readonly ANIM_INTERVAL = 1000 * .5;
    private static readonly COOLDOWN_TIME = Math.floor(g.game.fps * 0.2);
    private static readonly MAX_DISTANCE = Math.sqrt(Math.pow(g.game.width, 2) + Math.pow(g.game.height, 2));
    private static readonly MAX_JUMP_HEIGHT = 5;
    private static readonly MAX_SCALE = 3;
    private static readonly DEFAULT_POWER = 2.5;
    private static readonly POWER_UP_TIME = g.game.fps * 8;
    private static readonly POWER_UP_RATE = 1.5;
    private static readonly POWER_UP_JUMP_RATE = 0.75;

    onGround: g.Trigger<EasterBunny> = new g.Trigger();
    onNormal: g.Trigger<EasterBunny> = new g.Trigger();

    private _ears: Ears;
    private _power: number = EasterBunny.DEFAULT_POWER;
    private _dest: g.CommonOffset;
    private _jumpFrames: number = 0;
    private _step: number = 0;
    private _cooldownTime: number = 0;
    private _isPowerUp: boolean = false;
    private _powerUpFrames: number = 0;
    private _clideTime: number = 0;

    constructor(scene: g.Scene, shadow: Shadow) {
        super({
            scene: scene,
            src: scene.asset.getImageById("easter_bunny_egg"),
            srcWidth: 72,
            srcHeight: 64,
            width: 72,
            height: 64,
            x: g.game.width / 2,
            y: g.game.height / 2,
            anchorX: 0.5,
            anchorY: 0.5,
            frames: AnimFrames.NORMAL,
            interval: EasterBunny.ANIM_INTERVAL,
        }, shadow);

        this.start();

        this._shadow.opacity = .5;
        this._shadow.move(this);

        this._ears = new Ears(scene, EasterBunny.ANIM_INTERVAL);
        this._ears.x = this.width / 2;
        this._ears.y = -this.height / 2 + this._ears.height * 0.2;
        this._ears.start();
        this.append(this._ears);


        const updateHandler = () => {
            if (this._isPowerUp) {
                if (this._powerUpFrames-- <= 0) {
                    this._isPowerUp = false;
                    this._power = EasterBunny.DEFAULT_POWER;
                    this.startNormalAnimation();
                    this.onNormal.fire(this);
                }
            }

            if (!this.isJumping) {
                if (this._cooldownTime > 0) {
                    this._cooldownTime--;
                    if (this._cooldownTime <= 0) {
                        if (!this._isPowerUp) {
                            this.startNormalAnimation();
                        }
                    }
                }
                if (this._clideTime > 0) {
                    this._clideTime--;
                    if (this._clideTime <= 0) {
                        this.startNormalAnimation();
                    }
                }
                return;
            };

            this.x += this.vx;
            const sin = Math.sin(Math.PI * (++this._step / this._jumpFrames));
            const vz = this.height * sin * EasterBunny.MAX_JUMP_HEIGHT;
            this.z += this.vy;
            this.y = this.z - vz;
            this.setDirection(this.vx, sin * EasterBunny.MAX_SCALE + 1);

            if (this._step === Math.floor(this._jumpFrames * 0.8)) {
                this._ears.falling(this._isPowerUp);
            } else if (this._step >= this._jumpFrames) {
                this._isJumping = false;

                if (this._isPowerUp) {
                    this._cooldownTime = 1;
                    this.frames = AnimFrames.POWER_UP_GROUND;
                } else {
                    this._cooldownTime = EasterBunny.COOLDOWN_TIME;
                    this.frames = AnimFrames.GROUND;
                    this.frameNumber = 0;
                    this.loop = false;
                }

                this.x = this._dest.x;
                this.y = this._dest.y - this.height / 2;
                this.setDirection(this.vx, 1);

                this._ears.ground(this._isPowerUp);
                this._shadow.scale(1);
                this._shadow.move(this);

                this.onGround.fire(this);
            } else {
                this._shadow.scale((1 - sin) * (1 - 0.25) + 0.25);
                this._shadow.move({ x: this.x, y: this.z, width: 0, height: this.height });
            }

            this.modified();
        };
        this.onUpdate.add(updateHandler);
    }

    get canJump(): boolean { return !this._isJumping && this._cooldownTime <= 0 }

    jump = (pos: g.CommonOffset) => {
        this._isJumping = true;
        this._clideTime = 0;

        this.frames = this._isPowerUp ? AnimFrames.POWER_UP_JUMPING : AnimFrames.JUMPING;
        this.frameNumber = 0;
        this.loop = false;
        this.modified();

        this._ears.jumping(this._isPowerUp);

        this._step = 0;
        this.z = this.y;
        const dx = pos.x - this.x;
        const dy = pos.y - this.height / 2 - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const frames = Math.floor((distance / EasterBunny.MAX_DISTANCE) * g.game.fps) + g.game.fps;
        this._jumpFrames = frames * (this._isPowerUp ? EasterBunny.POWER_UP_JUMP_RATE : 1);

        this.vx = dx / this._jumpFrames;
        this.vy = dy / this._jumpFrames;
        this._dest = { x: pos.x, y: pos.y };
    };

    private setDirection = (vx: number, scale: number = 1) => {
        this.scaleX = scale * (vx < 0 ? Direction.LEFT : Direction.RIGHT);
        this.scaleY = scale;
        this.modified();
    };

    collideEgg = () => {
        if (this._isPowerUp) return;

        this._clideTime = EasterBunny.COOLDOWN_TIME;
        this.frames = AnimFrames.GROUND;
        this.frameNumber = 0;
        this.loop = false;
        this.modified();
        this._ears.ground(false);
    };

    get power(): number { return this._power * this.width; }

    powerUp = (): void => {
        this._isPowerUp = true;
        this._power = EasterBunny.DEFAULT_POWER * EasterBunny.POWER_UP_RATE;
        this._powerUpFrames = EasterBunny.POWER_UP_TIME;
        this.startPowerUpAnimation();
    };

    get isPowerUp(): boolean { return this._isPowerUp; }

    private startNormalAnimation = (): void => {
        this.frames = AnimFrames.NORMAL;
        this.frameNumber = 0;
        this.loop = true;
        this.modified();
        this.start();
        this._ears.startNormalAnimation();
    };

    private startPowerUpAnimation = () => {
        this.frames = AnimFrames.POWER_UP;
        this.frameNumber = 0;
        this.loop = true;
        this.modified();
        this.start();
        this._ears.startPowerUpAnimation();
    };

    getSize(): g.CommonSize {
        return { width: this._power * this.width, height: this._power * this.height };
    }

    setX = (x: number): void => {
        this.x = x;
        this.modified();
        this._shadow.x = x;
        this._shadow.modified();
    };

    setY = (y: number): void => {
        this.y = y;
        this.modified();
        this._shadow.y = this.y + this.height / 2;
        this._shadow.modified();
    };
}