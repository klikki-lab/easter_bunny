import { FontSize } from "../../common/fontSize";

export class Score extends g.Label {

    private static readonly MULTI_BONUS = 10;

    constructor(scene: g.Scene, font: g.DynamicFont) {
        super({
            scene: scene,
            text: `SCORE  ${g.game.vars.gameState.score}`,
            font: font,
            fontSize: FontSize.LARGE,
            x: g.game.width / 2,
            y: FontSize.LARGE / 2,
            anchorX: 0.5,
        });
    }

    /**
     * 得点を加算する。マルチコンボボーナスを含めた得点は スコア * combo。
     * @param score スコア
     * @param combo マルチコンボ数
     * @returns score + combo * 100
     */
    add = (score: number, combo: number = 1): number => {
        const result = score * Math.max(combo, 1);
        // const multiComboBonus = combo <= 1 ? 0 : Score.MULTI_BONUS << (combo - 1);
        // const result = score + multiComboBonus;
        g.game.vars.gameState.score += result;
        this.text = `SCORE ${g.game.vars.gameState.score}`;
        this.invalidate();
        return result;
    };
}