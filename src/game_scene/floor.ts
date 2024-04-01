export class Floor extends g.FilledRect {

    constructor(scene: g.Scene, parent?: g.E | g.Scene) {
        super({
            scene: scene,
            parent: parent,
            width: g.game.width + 64,
            height: g.game.height + 64,
            cssColor: "#bbd",
            x: -32,
            y: -32
        });

        const num = 8;
        const size = Math.max(g.game.width, g.game.height) / Math.sqrt(2) / num;
        const l = size * Math.sqrt(2);
        for (let y = 0; y < Math.round(g.game.height / size); y++) {
            for (let x = 0; x < Math.round(g.game.width / size); x++) {
                new g.FilledRect({
                    scene: scene,
                    parent: this,
                    width: size,
                    height: size,
                    x: x * l,
                    y: y * l,
                    cssColor: "#aac",
                    anchorX: .5,
                    anchorY: .5,
                    angle: 45,
                });
            }
        }
    }
}