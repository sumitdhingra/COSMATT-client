export class PopupOutput {

    /**
     * TODO
     * 1. Create structure for this class
     */

    private _outputData: any;

    get outputData() {
        return this._outputData;
    }
    set outputData(newData: any) {
        this._outputData = newData;
    }
    constructor(outputData: any) {
        this._outputData = outputData;
    }
}