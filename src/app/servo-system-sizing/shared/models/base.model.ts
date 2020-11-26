
export class BaseModel {
    ignoreKeys: string[] = [];
    toJSON(): object {
        this.ignoreKeys.push('ignoreKeys');
        const object: any = {};
        for (const key of Object.keys(this)) {
            if (this.ignoreKeys.includes(key)) {
                continue;
            }
            object[key.replace('_', '')] = this[key];
        }
        return object;
    }
}
