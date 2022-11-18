import {shortcutKeys, generateShortcutCode} from "./commonShortcut";
import { SYSTEM_COMPONENT_LIST } from './utils'
const { CTRL, ATL, SHIFT } = shortcutKeys


const  generateReservedShortcuts= (arr) => {
    const rsShortcuts = {}
    arr.forEach(value => {
        const [keys, compName] = value;
        rsShortcuts[generateShortcutCode(keys)] =   compName;
    });
    return rsShortcuts;
}

export const SYSTEM_RESERVED_SHORTCUTS = generateReservedShortcuts([
    [[CTRL, 'y'], SYSTEM_COMPONENT_LIST.EDITOR],
    [[CTRL, 'z'], SYSTEM_COMPONENT_LIST.EDITOR],
])

export const USER_RESERVERD_SHORTCUTS =generateReservedShortcuts([

])