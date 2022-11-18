import { useRef, useState } from "react";

export const UNDO_CODES = {
    CHARACTER_ADDED: 0,
    SPACE_CHARACTER_ADDED: 1,
    NEW_LINE_ADDED_WITH_CHANGE: 2,
    NEW_LINE_ADDED_WITHOUT_CHANGE: 3,
}

Object.freeze(UNDO_CODES)

class StackObject {
    defaultProps = {
        isRelated: false,
        isSelection: false
    }

    constructor(changeType, lineNumber, caretIndex, text, options = {}) {
        this.ChangeType = changeType;
        this.lineNumber = lineNumber;
        this.caretIndex = caretIndex;
        this.text = text;
        // isRelated is used to determine that the new stack element is dependent on previous stack changes
        // and should undo, redo continuously.
        this.isRelated = (options.isRelated && options.isRelated.constructor === Boolean) ? options.isRelated : this.defaultProps.isRelated
        this.isSelection = (options.isSelection && options.isSelection.constructor === Boolean) ? options.isSelection : this.defaultProps.isSelection
        this.addSelectionProps(this.isSelection, options)
    }

    addSelectionProps(isSelection, options) {
        if (!isSelection)
            return
        this.endLine = options.endLine
        this.endIndex = options.endIndex

        if (this.endLine.constructor !== Number && this.endLine < 1)
            throw new Error('Numeral value endLine was not found or is less than 1')

        if (this.endIndex.constructor !== Number && this.endIndex < 0)
            throw new Error('Numeral value endIndex was not found or is less than 0')
    }
}

export const useUndoRedo = (props) => {

    const defaultProps = {
        enabled: false,
        STACK_SIZE_LIMIT: 400,
    }

    props = { ...props, ...defaultProps }
    const changesStack = useRef([]);

    // The actual stack might contain more elements than stack size limit as some stackObjects might be related.
    // The state is used to track the relative stack size and impose stack size limit.

    const relativeStackSize = useRef(0);
    const presentIndex = useRef(-1);
    const [historyTraversalEnabled, setHistoryTraversalEnabled] = useState(false);

    const pushNewStackObject = (changeType, lineNumber, caretIndex, text, options) => {

        // Remove old elements from the stack if stack size limit is exceeded.
        const stackBuffer = props.STACK_SIZE_LIMIT - relativeStackSize.current;
        if (stackBuffer < 0) {
            changesStack.current.splice(0, Math.abs(stackBuffer))
        }

        // Push new changes to the stack.
        changesStack.current.push(StackObject(changeType, lineNumber, caretIndex, text, options))

        if (!options.isRelated)
            relativeStackSize.current += 1
    }

    const pushToStack = (changeType, char, lineNumber, caretIndex) => {
        if (!props.enabled)
            return;

        const isStackEmpty = changesStack.current.length !== 0
        const lastStackObject = changesStack.current[changesStack.current.length - 1];
        let objChangeType, objLineNumber, objCaretIndex, objText;

        if (!isStackEmpty) {
            objChangeType = lastStackObject.changeType;
            objLineNumber = lastStackObject.lineNumber;
            objCaretIndex = lastStackObject.caretIndex;
            objText = lastStackObject.text;
        }

        if (changeType === UNDO_CODES.CHARACTER_ADDED) {
            if (!isStackEmpty) {
                if (objLineNumber === lineNumber && objCaretIndex + 1 === caretIndex) {
                    lastStackObject.objText = objText + char
                    return lastStackObject.objCaretIndex += objCaretIndex + 1
                }
            }
            pushNewStackObject(changeType, lineNumber, caretIndex, char);
        }

        else if (changeType === UNDO_CODES.SPACE_CHARACTER_ADDED) {
            if (!isStackEmpty) {
                // Continuous spaces are being added.
                if (objLineNumber === lineNumber && objCaretIndex + 1 === caretIndex && objText.slice(-1) === " ") {
                    lastStackObject.objText += " "
                    return lastStackObject.objCaretIndex += 1
                }
            }
            pushNewStackObject(changeType, lineNumber, caretIndex, char);
        }

        else if (changeType === UNDO_CODES.NEW_LINE_ADDED_WITH_CHANGE) {
            
        }
        else if (changeType === UNDO_CODES.NEW_LINE_ADDED_WITHOUT_CHANGE) {

        }
    }

    // Return function list to be used in any text edit component.
    return {

    }
}

export const undoEditor = () =>{
    console.log('undo')
}

export const redoEditor = () =>{
    console.log('redo')
}