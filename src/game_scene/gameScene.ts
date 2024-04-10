import { GameMainParameterObject } from "../parameterObject";
import { EasterEgg } from "./egg/easter_egg/easterEgg";
import { EasterBunny } from "./egg/easter_bunny/easterBunny";
import { Shadow } from "./egg/shadow";
import { FontSize } from "../common/fontSize";
import { RedEgg } from "./egg/easter_egg/redEgg";
import { Score } from "./hud/score";
import { TextSpawn } from "./effect/textSpawn";
import { CountdownTimer } from "./hud/countdownTimer";
import { GreenEgg } from "./egg/easter_egg/greenEgg";
import { BlueEgg } from "./egg/easter_egg/blueEgg";
import { GoldEgg } from "./egg/easter_egg/goldEgg";
import { Dust } from "./effect/dust";
import { CommonScene } from "../common/commonScene";
import { GameStart } from "./gameStart";
import { Sight } from "./sight";
import { GameFinish } from "./gameFinish";
import { Floor } from "./floor";
import { AudioController, SoundEffectAssetParams } from "../common/audioController";
import { MusicId, SoundEffectId } from "../common/audioId";
import { Blackout } from "./blackout";
import { RainbowEgg } from "./egg/easter_egg/rainbowEgg";
import { Carrot } from "./carrot";

export class GameScene extends CommonScene {

    private static readonly REINBOW_EGG_SPAWN_RATE = 0.005;
    static readonly COLOR_PINK = "#ffcbcb";

    private camera: g.Camera2D;
    private bunny: EasterBunny;
    private sight: Sight;
    private mouseCursor: g.Sprite;
    private shadowLayer: g.E;
    private effectLayer: g.E;
    private carrotLayer: g.E;
    private labelLayer: g.E;
    private eggBackgroundLayer: g.E;
    private eggForegroundLayer: g.E;
    private hudLayer: g.E;
    private textLayer: g.E;
    private score: Score;
    private hudFont: g.DynamicFont;
    private spawnFont: g.DynamicFont;
    private random: g.RandomGenerator;
    private audio: AudioController;
    private rainbowEggSpawnRate: number = GameScene.REINBOW_EGG_SPAWN_RATE;

    constructor(param: GameMainParameterObject, timeLimit: number) {
        super({
            game: g.game,
            name: "game scene",
            assetIds: [
                "easter_bunny_egg", "easter_bunny_ears", "img_carrot",
                "easter_egg_red", "easter_egg_green", "easter_egg_blue",
                "easter_egg_gold", "easter_egg_rainbow",
                "img_shadow", "img_sight", "mouse_cursor",
                "bgm", "bgm_power_up", "se_jump", "se_ground", "se_crack", "se_collide", "se_creature",
            ],
        }, timeLimit);

        this.random = param.random ?? g.game.random;

        this.camera = new g.Camera2D({});
        g.game.focusingCamera = this.camera;
        g.game.modified();

        this.onLoad.add(this.loadHandler);
    }

    private detectBunnyCollision = (egg: g.E): void => {
        if (!(egg instanceof EasterEgg)) return;
        if (!egg.isApperar || egg.isJumping) return;

        if (g.Collision.withinAreas(this.bunny, egg, this.bunny.height * .9)) {
            this.audio.playSE(SoundEffectId.COLLIDE);
            this.bunny.collideEgg();
            egg.collide(this.bunny);
        }
    };

    private detectBunnyPosition = (egg: g.E): void => {
        if (!(egg instanceof EasterEgg)) return;
        if (g.Util.distanceBetweenOffsets(this.bunny, egg) > this.bunny.height * 1.75) return;

        this.appendEggLayer(egg);
    };

    private updateHandler = (): void => {
        if (!this.bunny.isJumping) {
            this.eggForegroundLayer.children?.forEach(this.detectBunnyCollision);
            this.eggBackgroundLayer.children?.forEach(this.detectBunnyCollision);
        }

        const foreground = this.eggForegroundLayer.children?.length ?? 0;
        for (let i = foreground - 1; i >= 0; i--) {
            this.detectBunnyPosition(this.eggForegroundLayer.children[i]);
        }
        const background = this.eggBackgroundLayer.children?.length ?? 0;
        for (let i = background - 1; i >= 0; i--) {
            this.detectBunnyPosition(this.eggBackgroundLayer.children[i]);
        }
    };

    private loadHandler = (_scene: g.Scene): void => {
        new Floor(this, this);
        this.shadowLayer = new g.E({ scene: this, parent: this });
        this.effectLayer = new g.E({ scene: this, parent: this });
        this.sight = new Sight(this, this.effectLayer);
        this.carrotLayer = new g.E({ scene: this, parent: this });

        this.eggBackgroundLayer = new g.E({ scene: this, parent: this });

        this.append(this.bunny = this.createBunnyEgg());

        this.eggForegroundLayer = new g.E({ scene: this, parent: this });

        this.hudFont = this.createDynamicFont();
        this.spawnFont = this.createDynamicFont("white", "#544", FontSize.MEDIUM);

        this.labelLayer = new g.E({ scene: this, parent: this });
        this.hudLayer = new g.E({ scene: this, parent: this });
        this.hudLayer.append(this.score = new Score(this, this.hudFont));

        const timer = new CountdownTimer(this, this.hudFont, this.timeLimit);
        timer.onStart.addOnce(this.createEggs);
        timer.onTick.add(this.createEggs);
        timer.onFinish.addOnce(this.gameOver);
        this.hudLayer.append(timer);

        this.textLayer = new g.E({ scene: this, parent: this });


        const blackout = new Blackout(this, this);
        blackout.close();
        const start = new GameStart(this, this.createDynamicFont("white", "black", FontSize.XL, "sans-serif"));
        start.onFinish.add(() => {
            blackout.open();
            timer.start();
            this.onPointDownCapture.add(this.pointDownHandler);
            this.onUpdate.add(this.updateHandler);
        });
        this.append(start);

        this.audio = this.createAudioAssetController();
        this.audio.playMusic(MusicId.NORMAL);

        // const cursor = this.createMouseCursor();
        // if (cursor) {
        //     this.mouseCursor = cursor;
        //     this.append(cursor);
        // }
    };

    private pointDownHandler = (ev: g.PointDownEvent): void => {
        if (this.bunny.canJump) {
            this.audio.playSE(SoundEffectId.JUMP);
            this.bunny.jump(ev.point);
            this.sight.target(ev.point);
        }
    };

    private createBunnyEgg = (): EasterBunny => {
        const bunny = new EasterBunny(this, new Shadow(this, this.shadowLayer));
        bunny.onGround.add(bunny => {
            this.audio.playSE(SoundEffectId.GROUND);
            this.sight.stop();
            this.shakeCamera();

            this.checkCllideEggLayer(bunny);
            this.checkCllideCarrot(bunny);
            new Dust(this, this.effectLayer, bunny.getGroundPos(), bunny.getSize(), GameScene.COLOR_PINK);
        });
        bunny.onNormal.add(_bunny => {
            this.audio.stopMusic(MusicId.POWER_UP);
            this.audio.playMusic(MusicId.NORMAL);
        });
        return bunny;
    };

    private checkCllideCarrot = (bunny: EasterBunny) => {
        this.carrotLayer.children?.forEach(carrot => {
            if (g.Collision.within(bunny.getGroundX(), bunny.getGroundY(), carrot.x, carrot.y, bunny.power)) {
                if (!bunny.isPowerUp) {
                    this.audio.stopMusic(MusicId.NORMAL);
                    this.audio.playMusic(MusicId.POWER_UP);
                }
                bunny.powerUp();
                new Dust(this, this.effectLayer, { x: carrot.x, y: carrot.y }, { width: carrot.width, height: carrot.height }, "orange");

                if (carrot instanceof Carrot) {
                    this.addScore(carrot.score, 0, carrot);
                }
                carrot.destroy();
            }
        })
    };

    private checkCllideEggLayer = (bunny: EasterBunny) => {
        const colide = (egg: EasterEgg): void => {
            score += egg.score;
            combo++;
            this.rainbowEggSpawnRate += egg.isNaked() ? 0.001 : 0.0001;
            console.log(this.rainbowEggSpawnRate);
        };

        let score = 0;
        let combo = 0;
        this.eggForegroundLayer.children?.forEach((egg: g.E) => {
            if (egg instanceof EasterEgg && this.checkCollideEgg(bunny, egg)) {
                colide(egg);
            }
        });
        this.eggBackgroundLayer.children?.forEach((egg: g.E) => {
            if (egg instanceof EasterEgg && this.checkCollideEgg(bunny, egg)) {
                colide(egg);
            }
        });
        if (combo > 0) {
            this.addScore(score, combo, bunny);
        }
    };

    private addScore = (score: number, combo: number, target: g.CommonArea) => {
        const result = this.score.add(score, combo);
        let x = target.x;
        if (target.x < target.width) {
            x = target.width;
        } else if (target.x > g.game.width - target.width) {
            x = g.game.width - target.width;
        }
        let y = target.y - target.height / 2;
        if (target.y < target.height * 2) {
            y = target.height * 2;
        }
        const scoreSpawn = new TextSpawn(this, this.spawnFont, result.toString(), { x: x, y: y });
        this.textLayer.append(scoreSpawn);
    };

    private checkCollideEgg = (bunny: EasterBunny, egg: EasterEgg): boolean => {
        if (!egg.isApperar || egg.isJumping) return;

        if (g.Collision.within(bunny.getGroundX(), bunny.getGroundY(), egg.getGroundX(), egg.getGroundY(), bunny.power)) {
            const distance = Math.floor(g.Util.distanceBetweenAreas(bunny, egg) / (bunny.power / 4));
            egg.crack(bunny, distance);
            return true;
        }
        return false;
    };

    private createEggs = (remainingSec: number) => {
        const elapsedSec = this.timeLimit - remainingSec;
        const thresholdSec = 15;
        const level = Math.floor(elapsedSec / thresholdSec) + 1;
        const maxEggNum = level * 4;

        const background = this.eggBackgroundLayer.children?.length ?? 0;
        const foreground = this.eggForegroundLayer.children?.length ?? 0;
        const length = background + foreground;
        if (length <= maxEggNum) {
            const waveEggNum = 5;
            const random = this.random.generate();
            if (elapsedSec === 0) {
                this.createGreenEgg(waveEggNum);
            } else if (elapsedSec < thresholdSec) {
                if (random < 0.75) {
                    this.createRedEgg(waveEggNum);
                } else {
                    this.createGreenEgg(waveEggNum);
                }
            } else if (elapsedSec < thresholdSec * 2) {
                if (this.random.generate() < 0.01) {
                    this.createGoldEgg();
                }
                if (random < 0.4) {
                    this.createRedEgg(waveEggNum);
                } else if (random < 0.9) {
                    this.createGreenEgg(waveEggNum);
                } else {
                    this.createBlueEgg(waveEggNum);
                }
            } else if (elapsedSec < thresholdSec * 3) {
                if (this.random.generate() < 0.02) {
                    this.createGoldEgg();
                }
                if (random < 0.2) {
                    this.createRedEgg(waveEggNum + 1);
                } else if (random < 0.8) {
                    this.createGreenEgg(waveEggNum + 1);
                } else {
                    this.createBlueEgg(waveEggNum);
                }
            } else {
                if (this.random.generate() < 0.05) {
                    this.createGoldEgg();
                }
                if (random < 0.1) {
                    this.createRedEgg(waveEggNum + 2);
                } else if (random < 0.75) {
                    this.createGreenEgg(waveEggNum + 2);
                } else {
                    this.createBlueEgg(waveEggNum + 1);
                }
            }
        }

        if (elapsedSec === 45 || elapsedSec === 53) {
            this.createGoldEgg();
        }

        if (elapsedSec >= 40 && this.random.generate() <= this.rainbowEggSpawnRate) {
            this.createRainbowEgg();
        }
    };

    private createBlueEgg = (eggNum: number): void => {
        for (let i = 0; i < eggNum; i++) {
            let x = 0;
            let y = 0;
            let targetX = 0;
            let targetY = 0;
            if (this.random.generate() < 0.5) {
                if (this.random.generate() < 0.5) {
                    x = -EasterEgg.SIZE;
                    targetX = g.game.width;
                } else {
                    x = g.game.width + EasterEgg.SIZE;
                    targetX = 0;
                }
                y = this.random.generate() * (g.game.height * 0.8) + (g.game.height * 0.1);
                targetY = g.game.height - y;
            } else {
                if (this.random.generate() < 0.5) {
                    y = -EasterEgg.SIZE;
                    targetY = g.game.height;
                } else {
                    y = g.game.height + EasterEgg.SIZE;
                    targetY = 0;
                }
                x = this.random.generate() * (g.game.width * 0.8) + (g.game.width * 0.1);
                targetX = g.game.width - x;
            }
            const egg = new BlueEgg(this, new Shadow(this, this.shadowLayer));
            egg.init(x, y, targetX, targetY);
            this.bouncedEgg(egg, BlueEgg.COLOR);
            this.appendEggLayer(egg);
        }
    };

    private createRedEgg = (eggNum: number): void => {
        const targetX = this.random.generate() * (g.game.width * 0.6) + (g.game.width * 0.2);
        const targetY = this.random.generate() * (g.game.height * 0.6) + (g.game.height * 0.2);

        const maxX = Math.max(Math.abs(g.game.width - targetX), targetX);
        const maxY = Math.max(Math.abs(g.game.height - targetY), targetY);
        const maxDistance = Math.max(maxX, maxY);
        for (let i = 0; i < eggNum; i++) {
            const egg = new RedEgg(this, new Shadow(this, this.shadowLayer));
            const radius = maxDistance + Math.max(egg.width, egg.height);
            const angle = 2 * Math.PI * (i / eggNum);
            const eggX = targetX + Math.cos(angle) * radius;
            const eggY = targetY + Math.sin(angle) * radius;
            egg.init(eggX, eggY, targetX, targetY);
            this.bouncedEgg(egg, RedEgg.COLOR);
            this.appendEggLayer(egg);
        }
    };

    private createGreenEgg = (eggNum: number): void => {
        let x = 0;
        let y = 0;
        let targetX = 0;
        let targetY = 0;
        if (this.random.generate() < 0.5) {
            if (this.random.generate() < 0.5) {
                x = -GreenEgg.RADIUS * 1.25;
                targetX = g.game.width;
            } else {
                x = g.game.width + GreenEgg.RADIUS * 1.25;
                targetX = 0;
            }
            y = this.random.generate() * (g.game.height * 0.8) + (g.game.height * 0.1);
            targetY = g.game.height - y;
        } else {
            if (this.random.generate() < 0.5) {
                y = -GreenEgg.RADIUS * 1.25;
                targetY = g.game.height;
            } else {
                y = g.game.height + GreenEgg.RADIUS * 1.25;
                targetY = 0;
            }
            x = this.random.generate() * (g.game.width * 0.8) + (g.game.width * 0.1);
            targetX = g.game.width - x;
        }
        for (let i = 0; i < eggNum; i++) {
            const egg = new GreenEgg(this, new Shadow(this, this.shadowLayer), i / eggNum, x, y);
            const rx = Math.cos(2 * Math.PI * (i / eggNum)) * GreenEgg.RADIUS;
            const ry = Math.sin(2 * Math.PI * (i / eggNum)) * GreenEgg.RADIUS;
            egg.init(x + rx, y + ry, targetX + rx, targetY + ry);
            this.bouncedEgg(egg, GreenEgg.COLOR);
            this.appendEggLayer(egg);
        }
    };

    private createGoldEgg = (): void => {
        let x = 0;
        let targetX = 0;
        if (this.random.generate() < 0.5) {
            x = -EasterEgg.SIZE;
            targetX = g.game.width;
        } else {
            x = g.game.width + EasterEgg.SIZE;
            targetX = 0;
        }
        const y = this.random.generate() * (g.game.height * 0.8) + (g.game.height * 0.1);
        const targetY = g.game.height - y;
        const egg = new GoldEgg(this, new Shadow(this, this.shadowLayer));
        egg.init(x, y, targetX, targetY);
        this.bouncedEgg(egg, GoldEgg.COLOR);
        this.appendEggLayer(egg);
    };

    private createRainbowEgg = (): void => {
        let y = 0;
        let targetY = 0;
        if (this.random.generate() < 0.5) {
            y = -EasterEgg.SIZE;
            targetY = g.game.height;
        } else {
            y = g.game.height + EasterEgg.SIZE;
            targetY = 0;
        }
        const x = this.random.generate() * (g.game.width * 0.8) + (g.game.width * 0.1);
        const targetX = g.game.width - x;
        const egg = new RainbowEgg(this, new Shadow(this, this.shadowLayer));
        egg.onCracked.addOnce(egg => {
            const shadow = new Shadow(this, this.shadowLayer);
            shadow.move(egg);
            this.carrotLayer.append(new Carrot(this, egg, shadow));
            new Dust(this, this.effectLayer, egg.getGroundPos(), egg, "orange");
            egg.destroy();
        });
        egg.init(x, y, targetX, targetY);
        this.bouncedEgg(egg, RainbowEgg.COLOR);
        this.appendEggLayer(egg);
        this.rainbowEggSpawnRate = GameScene.REINBOW_EGG_SPAWN_RATE;
    };

    private appendEggLayer = (egg: EasterEgg): void => {
        if (egg.getGroundY() > this.bunny.getGroundY()) {
            this.appendForegroundLayer(egg)
        } else {
            this.appendBackgroundLayer(egg);
        }
    };

    private appendForegroundLayer = (egg: EasterEgg) => {
        if (egg.parent !== this.eggForegroundLayer) {
            this.eggForegroundLayer.append(egg);
            if (this.eggBackgroundLayer.children && this.eggBackgroundLayer.children.indexOf(egg) !== -1) {
                this.eggBackgroundLayer.remove(egg);
            }
        }
    };

    private appendBackgroundLayer = (egg: EasterEgg) => {
        if (egg.parent !== this.eggBackgroundLayer) {
            this.eggBackgroundLayer.append(egg);
            if (this.eggForegroundLayer.children && this.eggForegroundLayer.children.indexOf(egg) !== -1) {
                this.eggForegroundLayer.remove(egg);
            }
        }
    };

    private bouncedEgg = (egg: EasterEgg, color: string): void => {
        egg.onBounced.add(egg => {
            this.audio.playSE(egg.isNaked() ? SoundEffectId.CREATURE : SoundEffectId.CRACK);
            new Dust(this, this.effectLayer, egg.getGroundPos(), egg, color);
        });
    };

    private gameOver = (): void => {
        this.onPointDownCapture.destroy();
        new Blackout(this, this.labelLayer).close();
        const finish = new GameFinish(this, this.createDynamicFont("white", "black", FontSize.XL, "sans-serif"));
        this.labelLayer.append(finish);
    };

    private shakeCamera = (): void => {
        const shakeTimes = 4;
        const delay = Math.floor(1000 / g.game.fps);
        for (let i = 0; i < shakeTimes; i++) {
            this.setTimeout(() => {
                const isLast = i >= shakeTimes - 1;
                const ry = isLast ? 0 : (g.game.random.generate() * 2 - 1) * 16 + 32;

                this.camera.y = ry;
                this.camera.modified();

                this.hudLayer.y = ry;
                this.hudLayer.modified();
            }, i * delay);
        }
    };

    private createAudioAssetController = (): AudioController => {
        const controller = new AudioController(this.asset, g.game.audio.music.volume, g.game.audio.sound.volume);
        controller.addBGM(["bgm", "bgm_power_up"]);
        const params: SoundEffectAssetParams[] = [
            { assetId: "se_jump" },
            { assetId: "se_ground", volumeRate: 0.5 },
            { assetId: "se_crack" },
            { assetId: "se_collide" },
            { assetId: "se_creature" }
        ];
        controller.addSE(params);
        return controller;
    };

    private createDynamicFont = (
        fontColor: string = "white",
        strokeColor: string = "black",
        size: number = FontSize.LARGE,
        fontFamily: string = "monospace") => new g.DynamicFont({
            game: g.game,
            fontFamily: fontFamily,
            fontColor: fontColor,
            fontWeight: "bold",
            size: size,
            strokeColor: strokeColor,
            strokeWidth: size / 6,
        });

    private createMouseCursor = (): g.Sprite | undefined => {
        if (typeof window !== "undefined") {
            const mouseCursor = new g.Sprite({
                scene: this,
                src: this.asset.getImageById("mouse_cursor"),
                anchorX: .5,
                anchorY: .5,
                opacity: .5,
            });

            window.addEventListener('mousemove', ev => {
                if (this.mouseCursor) {
                    const x = Math.min(ev.clientX, g.game.width);
                    const y = Math.min(ev.clientY, g.game.height);
                    mouseCursor.moveTo(x, y);
                    mouseCursor.modified();
                }
            });
            return mouseCursor;
        }
        return undefined;
    }
}