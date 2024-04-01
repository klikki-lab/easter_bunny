export class Sight extends g.Sprite {

    constructor(scene: g.Scene, parent: g.E | g.Scene) {
        super({
            scene: scene,
            parent: parent,
            src: scene.asset.getImageById("img_sight"),
            anchorX: .5,
            anchorY: .5,
            opacity: .25,
            hidden: true,
        });
    }

    target = (pos: g.CommonOffset) => {
        this.show();
        this.x = pos.x;
        this.y = pos.y;
        this.modified();
    }

    stop = () => { this.hide(); }
}