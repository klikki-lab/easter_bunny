import { Shadow } from "../shadow";
import { EasterEgg } from "./easterEgg";

export class RedEgg extends EasterEgg {

    static readonly COLOR = "#d88";

    constructor(scene: g.Scene, shadow: Shadow) {
        super(scene, "easter_egg_red", 10, shadow);
    }

    override init = (x: number, y: number, targetX?: number, targetY?: number): void => {
        super.init(x, y, targetX, targetY);
    }

    protected override move(): void {
        this.x += this.vx;
        this.y += this.vy;
        this.modified();
    }
}