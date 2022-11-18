import { useEffect, useRef } from 'react'

import { updateKeyboardShortcuts } from "../redux/actions/editor";

import { generateShortcutCode } from "./commonShortcut";
import { SYSTEM_RESERVED_SHORTCUTS, USER_RESERVERD_SHORTCUTS } from './settings'


const createNewShortcut = (keys, char, func, name) => {
    return {
        keys: keys,
        char: char,
        func: func,
        name: name
    }
}

export class Shortcut {
    constructor(keys, char, func, name) {
        this.keys = keys.sort();
        this.char = char
        this.func = func;
        this.name = name;
    } 
}

export const registerKeyboardShortcut = (shortcut, shortcutsList, componentName, dispatch, canOverride) => {
    if (shortcut.constructor !== Array)
        throw new Error('shortcut could be of type Array only')

    if (shortcut[0].constructor !== Array)
        shortcut = [shortcut]

    const updatedShortcuts = {};
    shortcut.forEach((valueRef, index) => {
        let value  = [...valueRef]
        if (value.length === 2)
            throw new Error("Couldn't find function to map shortcut to.")

        const [char, func] = value.splice(value.length - 2, 2);
        if (char.constructor !== String)
            throw new Error('No character key found to map shortcut to.')

        if (char.length > 1)
            throw new Error('Shortcut key should be a character, string found.')

        const shortcutString = generateShortcutCode([...value, char]);
        value = value.map(val => val.key)
        const oldShortcut = shortcutsList[shortcutString];
        const reservedCompName = (oldShortcut && oldShortcut.name) && (SYSTEM_RESERVED_SHORTCUTS[shortcutString] || USER_RESERVERD_SHORTCUTS[shortcutString])
        if (reservedCompName) {
            if (!!!canOverride || reservedCompName)
                throw new Error(`Component "${componentName}" is trying to override a
                shortcut already registered under component "${reservedCompName}".
                Shortcut Key Comb: ${[...value, char].join(" + ")}`)

            console.warn(`Component ${componentName} is has overridden a
                shortcut already registered under component ${reservedCompName}.\n
                Shortcut Key Comb: ${[...value, char].join(" + ")}`)
        }
        updatedShortcuts[shortcutString] = createNewShortcut(value, char, func, componentName);
    });
    dispatch(updateKeyboardShortcuts(updatedShortcuts));
}

export const useIsMounting = () => {
    const isMountRef = useRef(true);
    useEffect(() => {
      isMountRef.current = false;
    }, []);
    return isMountRef.current;
  };