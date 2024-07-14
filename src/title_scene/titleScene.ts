import { GameMainParameterObject } from "../parameterObject";
import { CommonScene } from "../common/commonScene";
import { EasterBunny } from "../game_scene/egg/easter_bunny/easterBunny";
import { Shadow } from "../game_scene/egg/shadow";
import { Dust } from "../game_scene/effect/dust";
import { GameScene } from "../game_scene/gameScene";
import { FontSize } from "../common/fontSize";
import { RedEgg } from "../game_scene/egg/easter_egg/redEgg";
import { EasterEgg } from "../game_scene/egg/easter_egg/easterEgg";
import { StartTimer } from "./startTimer";
import { Sight } from "../game_scene/sight";
import { TextSpawn } from "../game_scene/effect/textSpawn";
import { Floor } from "../game_scene/floor";
import { AudioController, SoundEffectAssetParams } from "../common/audioController";
import { SoundEffectId } from "../common/audioId";
import { Button } from "../common/button";

export class TitleScene extends CommonScene {

    onFinish: g.Trigger<void> = new g.Trigger();

    private camera: g.Camera2D;
    private title: g.Label;
    private tutorial: g.Label;
    private bunny: EasterBunny;
    private sight: Sight;
    private shadowLayer: g.E;
    private effectLayer: g.E;
    private eggForegroundLayer: g.E;
    private eggBackgroundLayer: g.E;
    private font: g.DynamicFont;
    private audio: AudioController;

    private progress: number = 0;

    constructor(_param: GameMainParameterObject, timeLimit: number) {
        super({
            game: g.game,
            name: "title scene",
            assetIds: [
                "easter_bunny_egg", "easter_bunny_ears", "easter_egg_red", "img_shadow", "img_sight",
                "se_jump", "se_ground", "se_crack", "se_collide", "se_creature",
            ],
        }, timeLimit);

        this.camera = new g.Camera2D({});
        g.game.focusingCamera = this.camera;
        g.game.modified();

        this.onLoad.add(this.loadHandler);
    }

    private loadHandler = () => {
        this.audio = this.createAudioAssetController();

        this.font = this.createDynamicFont("white", "black", FontSize.MEDIUM);
        new Floor(this, this);

        this.shadowLayer = new g.E({ scene: this, parent: this });
        this.effectLayer = new g.E({ scene: this, parent: this });
        this.sight = new Sight(this, this.effectLayer);

        this.eggBackgroundLayer = new g.E({ scene: this, parent: this });
        this.append(this.bunny = this.createBunnyEgg());
        this.eggForegroundLayer = new g.E({ scene: this, parent: this });

        this.title = this.createTitle();

        const timerFont = this.createDynamicFont("yellow", "black", FontSize.MEDIUM);
        const timer = new StartTimer(this, timerFont, this.timeLimit);
        timer.x = g.game.width - timer.width / 2;
        timer.y = g.game.height - timer.height;
        timer.onFinish.add(() => this.onFinish.fire());
        timer.start();
        this.append(timer);

        // const font = new g.DynamicFont({
        //     game: g.game,
        //     fontFamily: "sans-serif",
        //     fontWeight: "bold",
        //     strokeWidth: FontSize.MEDIUM / 6,
        //     strokeColor: "#222",
        //     fontColor: "white",
        //     size: FontSize.MEDIUM,
        // });
        // const startButton = new Button(this, font, "START!");
        // startButton.x = g.game.width - startButton.width / 2 - FontSize.MEDIUM;
        // startButton.y = g.game.height - startButton.height / 2 - FontSize.MEDIUM;
        // startButton.onClicked.add(_ => this.onFinish.fire());
        // this.append(startButton);

        this.tutorial = this.createLabel(this.createDynamicFont("white", "black", FontSize.MEDIUM), "画面をクリックしてね！");
        this.tutorial.x = this.bunny.x;
        this.tutorial.y = this.title.y + this.title.height * 1.5;

        const detectBunnyCollision = (egg: g.E): void => {
            if (!(egg instanceof EasterEgg)) return;
            if (!egg.isApperar || egg.isJumping) return;

            if (g.Collision.withinAreas(this.bunny, egg, this.bunny.height * .9)) {
                this.audio.playSE(SoundEffectId.COLLIDE);
                this.bunny.collideEgg();
                egg.collide(this.bunny);
            }
        };

        const detectBunnyPosition = (egg: g.E): void => {
            if (!(egg instanceof EasterEgg)) return;
            if (g.Util.distanceBetweenOffsets(this.bunny, egg) > this.bunny.height * 1.75) return;

            this.appendEggLayer(egg);
        };

        const updateHandler = (): void => {
            if (!this.bunny.isJumping) {
                this.eggForegroundLayer.children?.forEach(detectBunnyCollision);
                this.eggBackgroundLayer.children?.forEach(detectBunnyCollision);
            }

            const foreground = this.eggForegroundLayer.children?.length ?? 0;
            for (let i = foreground - 1; i >= 0; i--) {
                detectBunnyPosition(this.eggForegroundLayer.children[i]);
            }
            const background = this.eggBackgroundLayer.children?.length ?? 0;
            for (let i = background - 1; i >= 0; i--) {
                detectBunnyPosition(this.eggBackgroundLayer.children[i]);
            }
        };
        this.onUpdate.add(updateHandler);

        this.onPointDownCapture.add(ev => {
            if (ev.target?.parent instanceof Button) return;

            if (this.bunny.canJump) {
                this.audio.playSE(SoundEffectId.JUMP);
                this.bunny.jump(ev.point);
                this.sight.target(ev.point);

                if (this.progress === 0) {
                    this.tutorial.text = "ジャンプ！";
                    this.tutorial.invalidate();
                }
            }
        });
    };

    private createBunnyEgg = (): EasterBunny => {
        const bunny = new EasterBunny(this, new Shadow(this, this.shadowLayer));
        bunny.setY(g.game.height / 2);
        bunny.onGround.add(bunny => {
            this.audio.playSE(SoundEffectId.GROUND);
            this.sight.stop();
            this.shakeCamera();
            this.checkCollideEggLayer(bunny);
            new Dust(this, this.effectLayer, bunny.getGroundPos(), bunny.getSize(), GameScene.COLOR_PINK);

            if (this.progress === 0) {
                this.progress = 1;
                this.progressTutorial();
            }
        });
        return bunny;
    };

    private checkCollideEggLayer = (bunny: EasterBunny): void => {
        this.eggForegroundLayer.children?.forEach((egg: g.E) => {
            if (egg instanceof EasterEgg) {
                this.checkCollideEgg(bunny, egg)
            }
        });
        this.eggBackgroundLayer.children?.forEach((egg: g.E) => {
            if (egg instanceof EasterEgg) {
                this.checkCollideEgg(bunny, egg)
            }
        });
    };

    private checkCollideEgg = (bunny: EasterBunny, egg: EasterEgg): void => {
        if (!egg.isApperar || egg.isJumping) return;

        if (g.Collision.within(bunny.getGroundX(), bunny.getGroundY(), egg.getGroundX(), egg.getGroundY(), bunny.power)) {
            const distance = Math.floor(g.Util.distanceBetweenAreas(bunny, egg) / (bunny.power / 4));
            egg.crack(bunny, distance);

            this.progress++;
            if (this.progress === 2) {
                this.progressTutorial();
                this.spawnMessage("Nice!", egg);
            } else if (this.progress === 3) {
                this.spawnMessage("Excellent!", egg);
            } else if (this.progress === 4) {
                this.spawnMessage("Wonderful!", egg);
            } else if (this.progress >= 5) {
                this.spawnMessage("Superb!", egg);
            }
        }
    };

    private spawnMessage = (message: string, pos: g.E) => {
        this.eggForegroundLayer.append(new TextSpawn(this, this.font, message, pos));
    };

    private progressTutorial = (): void => {
        if (this.progress < 1 || this.progress > 2) return;

        if (this.progress === 1) {
            this.tutorial.text = "次はタマゴに向かってジャンプ！";
            this.createRedEgg();
        } else if (this.progress === 2) {
            this.tutorial.text = "イイ感じ！その調子でガンバってネ！";
        }
        this.tutorial.invalidate();
    };

    private createRedEgg = (): void => {
        const egg = new RedEgg(this, new Shadow(this, this.shadowLayer));
        const x = g.game.width / 2;
        const y = g.game.height + egg.height * 1.5;
        egg.init(x, y, this.bunny.x, this.bunny.y);
        egg.onBounced.add(_egg => {
            this.audio.playSE(egg.isNaked() ? SoundEffectId.CREATURE : SoundEffectId.CRACK);
            new Dust(this, this.effectLayer, egg.getGroundPos(), egg, RedEgg.COLOR);
        });
        this.appendEggLayer(egg);
    };

    private appendEggLayer = (egg: EasterEgg): void => {
        if (egg.getGroundY() > this.bunny.getGroundY()) {
            this.appendForegroundLayer(egg)
        } else {
            this.appendBackgroundLayer(egg);
        }
    };

    private appendForegroundLayer = (egg: EasterEgg): void => {
        if (egg.parent !== this.eggForegroundLayer) {
            this.eggForegroundLayer.append(egg);
            if (this.eggBackgroundLayer.children && this.eggBackgroundLayer.children.indexOf(egg) !== -1) {
                this.eggBackgroundLayer.remove(egg);
            }
        }
    };

    private appendBackgroundLayer = (egg: EasterEgg): void => {
        if (egg.parent !== this.eggBackgroundLayer) {
            this.eggBackgroundLayer.append(egg);
            if (this.eggForegroundLayer.children && this.eggForegroundLayer.children.indexOf(egg) !== -1) {
                this.eggForegroundLayer.remove(egg);
            }
        }
    };

    private shakeCamera = (): void => {
        const shakeTimes = 4;
        const delay = 1000 / g.game.fps;
        for (let i = 0; i < shakeTimes; i++) {
            this.setTimeout(() => {
                const isLast = i >= shakeTimes - 1;
                const ry = isLast ? 0 : (g.game.random.generate() * 2 - 1) * 16 + 32;

                this.camera.y = ry;
                this.camera.modified();

                this.title.y = FontSize.LARGE + ry;
                this.title.modified();
            }, i * delay);
        }
    };

    private createTitle = (): g.Label => new g.Label({
        scene: this,
        parent: this,
        text: "マジカルどっすん",
        font: this.createDynamicFont("#ff6868", "white", FontSize.LARGE * 2),
        x: g.game.width / 2,
        y: FontSize.LARGE,
        anchorX: 0.5,
    });

    private createLabel = (font: g.DynamicFont, text: string): g.Label => new g.Label({
        scene: this,
        parent: this,
        font: font,
        text: text,
        fontSize: font.size,
        anchorX: 0.5,
    });

    private createDynamicFont = (
        fontColor: string = "white",
        strokeColor: string = "black",
        fontSize: number = FontSize.LARGE): g.DynamicFont => new g.DynamicFont({
            game: g.game,
            fontFamily: "monospace",
            fontColor: fontColor,
            fontWeight: "bold",
            size: fontSize,
            strokeColor: strokeColor,
            strokeWidth: fontSize / 6,
        });

    private createAudioAssetController = (): AudioController => {
        const controller = new AudioController(this.asset, g.game.audio.music.volume, g.game.audio.sound.volume);
        const params: SoundEffectAssetParams[] = [
            { assetId: "se_jump" },
            { assetId: "se_ground", volumeRate: 0.8 },
            { assetId: "se_crack" },
            { assetId: "se_collide" },
            { assetId: "se_creature" }
        ];
        controller.addSE(params);
        return controller;
    };
}