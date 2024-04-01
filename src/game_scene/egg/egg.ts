import { Shadow } from "./shadow";

export abstract class Egg extends g.FrameSprite {

    protected vx: number = 0;
    protected vy: number = 0;
    protected z: number = 0;
    protected _isJumping = false;

    constructor(param: g.FrameSpriteParameterObject, protected _shadow: Shadow) {
        super(param);
    }

    get isJumping(): boolean { return this._isJumping; }

    getGroundX(): number { return this._shadow.x; }

    getGroundY(): number { return this._shadow.y; }

    getGroundPos(): g.CommonOffset { return { x: this.getGroundX(), y: this.getGroundY() }; }

    override destroy(destroySurface?: boolean): void {
        this._shadow?.destroy(destroySurface);
        if (!this.destroyed()) {
            super.destroy(destroySurface);
        }
    }
} 