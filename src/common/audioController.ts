interface SoundEffectParams {
    readonly audio: g.AudioAsset;
    readonly volume?: number;
    interval: number;
    age: number;
}

export interface SoundEffectAssetParams {
    assetId: string;
    volume?: number;
    interval?: number;
}

export class AudioController {

    private static readonly DEFAULT_MUSIC_VOLUME = 0.5;
    private static readonly DEFAULT_SE_VOLUME = 0.5;
    private static readonly DEFAULT_SE_INTERVAL = 2;

    private asset: g.AssetAccessor;
    private musicList: g.AudioAsset[] = [];
    private seList: SoundEffectParams[] = [];

    constructor(asset: g.AssetAccessor) {
        this.asset = asset;
    }

    addBGM = (assetIds: string[]): void => {
        assetIds.forEach(assetId => this.musicList.push(this.asset.getAudioById(assetId)));
    };

    playMusic = (index: number = 0): g.AudioPlayer => {
        const player = this.musicList[index].play();
        player.changeVolume(AudioController.DEFAULT_MUSIC_VOLUME);
        return player;
    }

    stopMusic = (index: number = 0): void => this.musicList[index].stop();

    addSE = (params: SoundEffectAssetParams[]): void => {
        params.forEach(param => {
            const interval = param.interval ?? AudioController.DEFAULT_SE_INTERVAL;
            const se: SoundEffectParams = {
                audio: this.asset.getAudioById(param.assetId),
                volume: param.volume ?? AudioController.DEFAULT_SE_VOLUME,
                interval: Math.max(0, interval),
                age: g.game.age,
            };
            this.seList.push(se);
        });
    };

    playSE = (index: number = 0): g.AudioPlayer | undefined => {
        const se = this.seList[index];
        if (se.interval) {
            if (g.game.age - se.age < se.interval) {
                return undefined;
            }
            se.age = g.game.age;
        }
        const player = se.audio.play();
        player.changeVolume(se.volume);
        return player;
    }
}