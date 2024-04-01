import { Shadow } from "../shadow";
import { EasterEgg } from "./easterEgg";

export class GoldEgg extends EasterEgg {

    static readonly COLOR = "#ffd700";

    constructor(scene: g.Scene, shadow: Shadow) {
        super(scene, "easter_egg_gold", 800, shadow, 3);
    }

    override init(x: number, y: number, targetX?: number, targetY?: number) {
        super.init(x, y, targetX, targetY);
    }

    protected override move(): void {
        this.x += this.vx;
        this.y += this.vy;
        this.modified();
    }
}