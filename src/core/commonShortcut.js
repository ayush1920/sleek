export class ShortcutKey {
    constructor(key) {
        this.key = key
    }
}

export const shortcutKeys = {
    CTRL: new ShortcutKey('ctrl'),
    ATL: new ShortcutKey('alt'),
    SHIFT: new ShortcutKey('shift'),
}


export const generateShortcutCode = (combination, char) => {
    if(!char)
        char = combination.pop();
    let shortcutString = [];
    combination.forEach((key, index) => {
        if (key.constructor !== ShortcutKey)
            throw new Error("shortcuts should be of type ShortcutKey. Coundn't find a function.")

        shortcutString.push(key.key[0])
    })
    return shortcutString.sort().join("") + '_' + char;
}