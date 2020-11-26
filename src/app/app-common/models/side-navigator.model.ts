import { MetaStatus } from 'app/app-common/models/side-navigator.enum';

/**
 * Main side-navigator data
 * 1. title - The heading of the side-nav menu. Ex- Table of Contents
 * 2. items - The menu items to show
 */
export class SideNavigatorData {
    private _title: string;
    private _items: SideNavigatorItem[];

    constructor(title: string, items: SideNavigatorItem[] = []) {
        this._title = title;
        this._items = items;
    }

    get title() {
        return this._title;
    }
    set title(val: string) {
        this._title = val;
    }

    get items() {
        return this._items;
    }
    set items(val: SideNavigatorItem[]) {
        this._items = val;
    }
};

/**
 * Individual item of side-navigator data
 * 1. id - string ID that will be displayed as serial number (1-based).
 *       - sub-children should have dot(.) separated IDs. Ex- 1.1, 1.2 etc.
 * 2. text - text to display for this item
 * 3. chilren - child side-nav items
 * 4. meta - metadata of side-nav items
 */
export class SideNavigatorItem {
    private _id: string;
    private _text: string;
    private _children: SideNavigatorItem[];
    private _meta: SideNavigatorItemMeta;

    constructor(id: string, text: string,
        children: SideNavigatorItem[] = [],
        meta: SideNavigatorItemMeta = new SideNavigatorItemMeta(MetaStatus.Incomplete, true)) {
        this._id = id;
        this._text = text;
        this._children = children;
        this._meta = meta;
    }

    get id() {
        return this._id;
    }
    set id(val: string) {
        this._id = val;
    }

    get text() {
        return this._text;
    }
    set text(val: string) {
        this._text = val;
    }

    get children() {
        return this._children;
    }
    set children(val: SideNavigatorItem[]) {
        this._children = val;
    }

    get meta() {
        return this._meta;
    }
    set meta(val: SideNavigatorItemMeta) {
        this._meta = val;
    }

};

/**
 * Meta data of individual side-nav item
 */
export class SideNavigatorItemMeta {
    private _status: MetaStatus;
    private _enabled: boolean;

    constructor(status: MetaStatus, enabled: boolean) {
        this._status = status;
        this._enabled = enabled;
    }

    get enabled() {
        return this._enabled;
    }
    set enabled(val: boolean) {
        this._enabled = val;
    }

    get status() {
        return this._status;
    }
    set status(val: MetaStatus) {
        this._status = val;
    }
}

