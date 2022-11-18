import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {useDispatch, useSelector} from "react-redux"

import EditorCodeLine from "./EditorCodeLine";

import {useIsMounting} from '../../../core/common'
import { useVerticalStorage, handleKeyDown, useMontonicCounter} from "../core/KeyboardEventHandler";
import { registerKeyboardShortcut } from "../../../core/common";
import { EDITOR_SHORTCUTS } from "../core/Shortcuts";
import { TAB_LENGTH, TAB_CHARACTER } from "../core/EditorSettings";
import { SYSTEM_COMPONENT_LIST } from "../../../core/utils";

const TextEditor = (props) => {
    // Refs
    const previousCaretPosition = useRef({ 'lineNumber': 1, 'index': 0 });
    const activeLineRef = useRef();
    const caretRef = useRef();
    const _lineContainers = useRef([<EditorCodeLine key={0} keyIndex={0} />])
    const digitCount = useRef(1);
    
    // Constants
    const compName = SYSTEM_COMPONENT_LIST.EDITOR;
    const lineContainer = _lineContainers.current;

    // Selectors
    const keyboardShortcuts = useSelector(state => state.editor.keyboardShortcuts);
    // States
    const [lineCounterVisible, setLineCounterVisible] = useState(true);
    const [lineCount, setLineCount] = useState(1);
    const [caretCharacter, setCaretCharacter] = useState('\u258C');
    const [caretClassName, setCaretClassName] = useState('term-caret');
    const [caretPosition, setCaretPosition] = useState(previousCaretPosition.current);
    const [editorOffsetTop, setEditorOffsetTop] = useState(0);
    const [editorOffsetLeft, setEditorOffsetLeft] = useState(0)
    const [lineCounter, setLineCounter] = useState([<div className="counter-line active" key={1}>1</div>]);

    // Custom keyboardShortcuts
    const isFirstMount = useIsMounting();
    const nextCounterNumber = useMontonicCounter();
    const verticalInfoStorage = useVerticalStorage();

    const dispatch = useDispatch();

    // Component Mount
    useEffect(() => {
        if (isFirstMount){
            registerKeyboardShortcut(EDITOR_SHORTCUTS, keyboardShortcuts, compName, dispatch, false);
        }

        const lineStyle = {
            fontSize: `${props.fontSize}px`,
            fontFamily: props.fontFamily,
            padding: `${props.linePadding}px`,
            lineHeight: `${props.fontSize}px`,
            minHeight: `${props.fontSize + 2 * props.linePadding + 2 * props.highlightBorderSize}px`,
            border: `${props.highlightBorderSize}px solid transparent`,
            boxSizing: 'border-box',
        }

        const lineHighlightStyle = {
            border: `${props.highlightBorderSize}px solid ${props.highlightBorderColor}`,
        }

        const counterLineStyle = {
            width: '100%',
            fontSize: `${props.fontSize}px`,
            fontFamily: props.fontFamily,
            padding: `${props.linePadding + props.highlightBorderSize}px`,
            lineHeight: `${props.fontSize}px`,
            minHeight: `${props.fontSize}px`,
        }

        updateCSSRule('.editor-line', lineStyle);
        updateCSSRule('.editor-line.active', lineHighlightStyle);
        updateCSSRule('.counter-line', counterLineStyle);
        setEditorOffsetTop(document.getElementsByClassName('input-area')[0].offsetParent.offsetTop);
        setEditorOffsetLeft(document.getElementsByClassName('input-area')[0].offsetLeft);

    }, [])

    // Caret Position Changed
    useLayoutEffect(() => {
        if (previousCaretPosition && previousCaretPosition.current.lineNumber !== caretPosition.lineNumber) {
            const inputLineHeight = props.fontSize + props.linePadding * 2 + 2 * props.highlightBorderSize;
            activeLineRef.current.style.top = `${(caretPosition.lineNumber - 1) * inputLineHeight}px`;
            caretRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
            const lineCounterCopy = lineCounter
            const lineContainerCopy = lineContainer
            if (previousCaretPosition.current.lineNumber <= lineCount) {
                lineCounterCopy[previousCaretPosition.current.lineNumber - 1] = React.cloneElement(lineCounterCopy[previousCaretPosition.current.lineNumber - 1], { 'className': 'counter-line' })
                lineContainerCopy[previousCaretPosition.current.lineNumber - 1] = React.cloneElement(lineContainerCopy[previousCaretPosition.current.lineNumber - 1], { 'isActive': false })
            }

            lineCounterCopy[caretPosition.lineNumber - 1] = React.cloneElement(lineCounterCopy[caretPosition.lineNumber - 1], { 'className': 'counter-line active' })
            lineContainerCopy[caretPosition.lineNumber - 1] = React.cloneElement(lineContainerCopy[caretPosition.lineNumber - 1], { 'isActive': true })

            setLineCounter([...lineCounterCopy]);
        }

        const activeLineText = lineContainer[caretPosition.lineNumber - 1].props.content || "";
        activeLineRef.current.children[0].innerHTML = activeLineText.substring(0, caretPosition.index);
        previousCaretPosition.current = caretPosition;

    }, [caretPosition])

    // Line visiblityChanged
    // :: TO_DO :: REMOVE THIS ONCE THE EDITOR IS IN SYNC WITH SETTINGS
    useEffect(() => {
        udpateLineCount()
    }, [lineCounterVisible])


    const setLineContainers = (value) => {
        _lineContainers.current = value;
        udpateLineCount();
    }
    const udpateLineCount = () => {
        // Tracks total line count for the file and renders lineNumber in the left panel
        const currentLineCount = _lineContainers.current.length;
        if (currentLineCount === lineCount || (!lineCounterVisible))
            return;

        const lineCounterCopy = lineCounter;
        if (currentLineCount > lineCount) {
            lineCounterCopy.push(<div className="counter-line" key={currentLineCount}>{currentLineCount}</div>)
        } else {
            lineCounterCopy.pop()
        }

        // Recalculate LeftOffset when line-counter width increases.
        if (digitCount.current !== (currentLineCount + "").length) {
            digitCount.current = (lineCount + "").length;
            setEditorOffsetLeft(document.getElementsByClassName('input-area')[0].offsetLeft);
        }

        setLineCounter(lineCounterCopy);
        setLineCount(currentLineCount);
    }

    const updateCSSRule = (selectorText, style) => {
        const updateStyle = (rule, style, selectorText) => {
            const keys = Object.keys(style);
            rule.selectorText = selectorText
            keys.forEach((key, index) => {
                rule.style[key] = style[key]
            })
            rule.selectorText = selectorText;
        }

        let selectorFound = false;

        for (let cssRuleListIndex = 0; cssRuleListIndex < document.styleSheets.length; cssRuleListIndex++) {
            const cssRules = document.styleSheets[cssRuleListIndex].cssRules;
            for (let cssRuleIndex = 0; cssRuleIndex < cssRules.length; cssRuleIndex++) {
                if (cssRules[cssRuleIndex].selectorText == selectorText) {
                    selectorFound = true;
                    updateStyle(cssRules[cssRuleIndex], style, selectorText);
                    break;
                }
            }

            if (selectorFound)
                break;
        }

        if (!selectorFound) {
            // Add new CSS Rule for first initialization
            const cssRuleLength = document.styleSheets[0].cssRules.length
            document.styleSheets[0].insertRule('*{}', cssRuleLength);
            updateStyle(document.styleSheets[0].cssRules[cssRuleLength], style, selectorText);
        }
    }

    const getClickPosition = (e) => {
        const xPos = Math.max(e.pageX - editorOffsetLeft, 0);
        const yPos = Math.max((e.target.className) ? e.nativeEvent.layerY : e.target.parentNode.parentNode.scrollTop + e.pageY - editorOffsetTop, 0);
        // const xPos = Math.max(e.pageX - - editorOffsetLeft, 0);
        // const yPos = Math.max(e.target.offsetTop, 0);
        const inputLineHeight = props.fontSize + props.linePadding * 2 + 2 * props.highlightBorderSize;
        const clickedLineNumber = Math.min(Math.floor(yPos / inputLineHeight) + 1, lineCount);
        const lineText = lineContainer[clickedLineNumber - 1].props.content || "";
        const charIndex = getTextWidth(xPos, lineText);
        setCaretPosition({ 'lineNumber': clickedLineNumber, 'index': charIndex })
        verticalInfoStorage.VerticalTraversalMode.current = false;
    }

    const getTextWidth = (xPos, lineText) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext("2d");
        context.font = `${props.fontSize}px ${props.fontFamily}`;
        let text = "";
        let textwidth = 0;
        let newTextWidth = 0;
        let charIndex = 0;
        let spaceLength = 0;
        let isTabCharacter = false;
        for (charIndex = 0; charIndex <= lineText.length; charIndex += 1) {
            const char = lineText[charIndex];
            text += char;

            if (char === " ")
                spaceLength += 1
            else
                spaceLength = 0
            newTextWidth = context.measureText(text).width;
            if (newTextWidth > xPos)
                break
            textwidth = newTextWidth;
        }
        if (spaceLength) {
            spaceLength = spaceLength % TAB_LENGTH
            spaceLength = (spaceLength === 0) ? TAB_LENGTH : spaceLength
            isTabCharacter = lineText.slice(charIndex + 1 - spaceLength, charIndex + 1 + TAB_LENGTH - spaceLength) === TAB_CHARACTER
            if (isTabCharacter) {
                charIndex = (spaceLength <= TAB_LENGTH - spaceLength) ? charIndex + 1 - spaceLength : charIndex + 1 - spaceLength + TAB_LENGTH;
            }
        }
        else
            // round xPos closer to textWidth or newTextWidth
            charIndex = (Math.abs(xPos - textwidth) <= Math.abs(xPos - newTextWidth)) ? charIndex : charIndex + 1
        charIndex = Math.min(charIndex, lineText.length)
        return charIndex;
    }


    return (
        <div className='code-area' onKeyDown={(e) => {
            handleKeyDown(e,
                caretPosition,
                setLineContainers,
                setCaretPosition,
                lineContainer,
                nextCounterNumber,
                verticalInfoStorage,
                keyboardShortcuts)

        }} tabIndex={0}>
            {lineCounterVisible &&
                <div className="code-line-counter">
                    {lineCounter}
                </div>
            }
            <div className="input-area" onClick={getClickPosition}>
                {lineContainer}
            </div>

            <div className="active-line" style={{
                fontSize: `${props.fontSize}px`,
                fontFamily: props.fontFamily,
                left: editorOffsetLeft,
                padding: `${props.highlightBorderSize + props.linePadding}px`,
                lineHeight: `${props.fontSize}px`,
                minHeight: `${props.fontSize}px`,
            }}
                ref={activeLineRef} onClick={getClickPosition}>

                <div style={{ lineHeight: `${props.fontSize}px`, height: '100%', zIndex: 3, position: 'relative' }} />
                <div className={caretClassName} style={{ fontSize: `${props.fontSize + 1 * props.linePadding}px` }}>
                    <span ref={caretRef}>{caretCharacter}</span>
                </div>
            </div>
        </div>
    )
}

TextEditor.defaultProps = {
    fontSize: 16,
    fontFamily: '"Lucida Console", "Courier New", monospace',
    linePadding: 1,
    highlightBorderSize: 1,
    highlightBorderColor: '#282828',
}

export default TextEditor