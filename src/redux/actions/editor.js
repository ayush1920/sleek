export const updateKeyboardShortcuts = (shortcutsList) => {
    return {
        type: 'UPDATE_KEYBOARD_SHORTCUTS',
        value:  shortcutsList,
    }
}