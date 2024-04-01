export class Dust {

    private static readonly MAX_SPRAY_SIZE = 8;

    constructor(scene: g.Scene, parent: g.E, pos: g.CommonOffset, size: g.CommonSize, cssColor: string) {
        for (let i = 0; i < Dust.MAX_SPRAY_SIZE; i++) {
            const rect = new g.FilledRect({
                scene: scene,
                parent: parent,
                width: size.width,
                height: size.height,
                cssColor: cssColor,
                x: pos.x,
                y: pos.y,
                anchorX: .5,
                anchorY: .5,
                opacity: 0.75,
            });

            const div = (2 * Math.PI) / Dust.MAX_SPRAY_SIZE;
            const angle = div * i;
            rect.angle = i * (360 / Dust.MAX_SPRAY_SIZE);
            rect.modified();

            const rate = (30 / g.game.fps);
            const radius = Math.max(size.width, size.height) * rate * 0.2;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            let vx = cos * radius;
            let vy = sin * radius;
            let value = 1;
            rect.onUpdate.add(() => {
                rect.x += vx;
                rect.y += vy;
                rect.scale(value);
                rect.modified();

                vx *= 0.7 * rate;
                vy *= 0.7 * rate;
                value *= 0.6 * rate;
                if (value < 0.01) {
                    rect.destroy();
                }
            });
        }
    }
}