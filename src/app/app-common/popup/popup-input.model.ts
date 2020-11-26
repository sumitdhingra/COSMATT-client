
// Popup component's input structure
export class PopupInput {

    // Header icon to show in header's top-left part
    private _headerIcon: string;
    // Title of header
    private _headerTitle: string;
    // Footer information to show in popup
    private _footerInfo: string;
    // The main input data which will be fed to whatever is inside the popup
    private _inputData: any;

    get headerTitle(): string {
        return this._headerTitle;
    }
    set headerTitle(headerTitle: string) {
        this._headerTitle = headerTitle;
    }

    get headerIcon(): string {
        return this._headerIcon;
    }
    set headerIcon(headerIcon: string) {
        this._headerIcon = headerIcon;
    }

    get inputData(): any {
        return this._inputData;
    }
    set inputData(inputData: any) {
        this._inputData = inputData;
    }

    get footerInfo(): string {
        return this._footerInfo;
    }
    set footerInfo(footerInfo: string) {
        this._footerInfo = footerInfo;
    }

    constructor(
        headerTitle: string = '',
        footerInfo: string = '',
        headerIcon: string = '',
        inputData: any = {}
    ) {
        this.inputData = inputData;
        this.headerTitle = headerTitle;
        this.footerInfo = footerInfo;
        this.headerIcon = headerIcon;
    }
}
