import { Shadow } from "../shadow";
import { EasterEgg } from "./easterEgg";

export class GreenEgg extends EasterEgg {

    static readonly COLOR = "#8c8";

    static readonly RADIUS = EasterEgg.SIZE * 1.25;
    private rotation: number;

    constructor(scene: g.Scene, shadow: Shadow, private phase: number, private cx: number, private cy: number) {
        super(scene, "easter_egg_green", 20, shadow);
        this.rotation = cx < g.game.width / 2 ? 0.1 : -0.1;
    }

    override init(x: number, y: number, targetX?: number, targetY?: number) {
        super.init(x, y, targetX, targetY);
    }

    protected override move(): void {
        const angle = 2 * Math.PI * this.phase;
        const rx = Math.cos(angle) * GreenEgg.RADIUS;
        const ry = Math.sin(angle) * GreenEgg.RADIUS;

        this.cx += this.vx;
        this.cy += this.vy;
        this.x = this.cx + rx;
        this.y = this.cy + ry;
        this.modified();

        this.phase += (1 / g.game.fps) * this.rotation;
    }
}