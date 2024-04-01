import { Shadow } from "../shadow";
import { EasterEgg } from "./easterEgg";

export class BlueEgg extends EasterEgg {

    static readonly COLOR = "#88c";

    constructor(scene: g.Scene, shadow: Shadow) {
        super(scene, "easter_egg_blue", 50, shadow, 2);
    }

    override init(x: number, y: number, targetX?: number, targetY?: number): void {
        super.init(x, y, targetX, targetY);
    }

    protected override move(): void {
        this.x += this.vx;
        this.y += this.vy;
        this.modified();
    }
}