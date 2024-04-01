import { FontSize } from "../../common/fontSize";

export class Score extends g.Label {

    private static readonly COMBO_BONUS = 100;

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
     * 得点を加算する。コンボボーナスを含めた得点は スコア + コンボ数 * 100 点。
     * @param score スコア
     * @param combo コンボ数
     * @returns score + combo * 100
     */
    add = (score: number, combo: number = 1): number => {
        const comboBonus = combo <= 1 ? 0 : combo * Score.COMBO_BONUS;
        const result = score + comboBonus;
        g.game.vars.gameState.score += result;
        this.text = `SCORE ${g.game.vars.gameState.score}`;
        this.invalidate();
        return result;
    };
}