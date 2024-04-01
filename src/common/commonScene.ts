export abstract class CommonScene extends g.Scene {

    constructor(param: g.SceneParameterObject, private _timeLimit: number) {
        super(param);
    }

    get timeLimit(): number { return this._timeLimit; }
}