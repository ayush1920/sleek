// This file is used to handle keyboard events in Text editor
import { useState, useRef } from "react"

import EditorCodeLine from "../components/EditorCodeLine";

import { TAB_LENGTH, TAB_CHARACTER } from './EditorSettings'

const BACKSPACE_KEY = 8;
const TAB_KEY = 9;
const ENTER_KEY = 13;
const SPACE_KEY = 32;
const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;
const DELETE = 46;

export const useVerticalStorage = () => {
	const VerticalTraversalMode = useRef(false);
	const VerticalTraversalIndex = useRef(0);
	return (
		{
			VerticalTraversalMode: VerticalTraversalMode,
			VerticalTraversalIndex: VerticalTraversalIndex
		}
	)
}

export const useMontonicCounter = () => {
	const counter = useRef(1);
	const getNextNumber = () => {
		const curvalue = counter.current;
		counter.current = curvalue + 1
		return curvalue;
	}
	return getNextNumber
}

export const handleKeyDown = (e, caretPosition, setLineContainers, setCaretPosition,
	lineContainer, nextCounterNumber, verticalInfoStorage, keyboardShortcuts) => {
	const keyCode = e.keyCode;
	const char = e.key;
	const isChar = char.length === 1
	if ((e.ctrlKey || e.altKey) && isChar)
		return handleKeyboardShortcuts(e, caretPosition, setLineContainers, setCaretPosition, lineContainer, nextCounterNumber, keyboardShortcuts)

	const { VerticalTraversalMode, VerticalTraversalIndex } = verticalInfoStorage;
	const lineIndex = caretPosition.lineNumber - 1;
	const caretIndex = caretPosition.index;
	let lineText = lineContainer[lineIndex].props.content || "";
	const lineKey = lineContainer[lineIndex].props.keyIndex;

	if (isChar) {
		if (keyCode === SPACE_KEY)
			e.preventDefault();

		lineText = lineText.slice(0, caretIndex) + char + lineText.slice(caretIndex,)
		const lineContainerCopy = lineContainer
		lineContainerCopy[lineIndex] = <EditorCodeLine content={lineText} key={lineKey} keyIndex={lineKey} />
		setLineContainers(lineContainerCopy);
		setCaretPosition({ 'lineNumber': lineIndex + 1, 'index': caretIndex + 1 })
		VerticalTraversalMode.current = false;
	}

	else if (keyCode === ENTER_KEY) {
		const lineContainerCopy = lineContainer;
		const newLineText = lineText.slice(caretIndex,)
		lineText = lineText.slice(0, caretIndex);
		const keyIndex = nextCounterNumber();
		lineContainerCopy.splice(
			lineIndex,
			1,
			<EditorCodeLine content={lineText} key={lineKey} keyIndex={lineKey} isActive={false} />,
			<EditorCodeLine content={newLineText} key={keyIndex} keyIndex={keyIndex} />)

		setLineContainers(lineContainerCopy);
		setCaretPosition({ 'lineNumber': lineIndex + 2, 'index': 0 });
		VerticalTraversalMode.current = false;
	}

	else if (keyCode === BACKSPACE_KEY) {
		const lineContainerCopy = lineContainer;
		const leftText = lineText.slice(0, caretIndex);
		const rightText = lineText.slice(caretIndex);

		if (caretIndex > 0) {
			let isTabCharacter = false
			const hasTabCountSpaces = caretIndex >= TAB_LENGTH && lineText.slice(caretIndex - TAB_LENGTH, caretIndex) === TAB_CHARACTER;

			if (hasTabCountSpaces) {
				let spaceCount = TAB_LENGTH
				let index = caretIndex - TAB_LENGTH - 1
				while (index > -1) {
					const char = lineText[index]
					if (char === " ")
						spaceCount += 1
					else
						break
					index -= 1
				}
				if (spaceCount % TAB_LENGTH === 0)
					isTabCharacter = true
			}

			const sliceEndIndex = isTabCharacter ? caretIndex - TAB_LENGTH : caretIndex - 1;

			lineContainerCopy.splice(lineIndex, 1, <EditorCodeLine content={leftText.slice(0, sliceEndIndex) + rightText} key={lineKey} keyIndex={lineKey} />)
			setLineContainers(lineContainerCopy)
			setCaretPosition({ 'lineNumber': lineIndex + 1, 'index': sliceEndIndex });
		}

		else {
			if (lineIndex === 0)
				return
			const previousLineText = lineContainer[lineIndex - 1].props.content || "";
			const newText = previousLineText + rightText;
			lineContainerCopy.splice(lineIndex - 1, 2,
				<EditorCodeLine content={newText} key={lineKey} keyIndex={lineKey} />)
			setLineContainers(lineContainerCopy)
			setCaretPosition({ 'lineNumber': lineIndex, 'index': previousLineText.length });
		}
		VerticalTraversalMode.current = false;
	}

	else if (keyCode === TAB_KEY) {
		e.preventDefault();
		const leftText = lineText.slice(0, caretIndex);
		const rightText = lineText.slice(caretIndex);
		const lineContainerCopy = lineContainer;
		lineContainerCopy.splice(lineIndex, 1,
			<EditorCodeLine content={leftText + TAB_CHARACTER + rightText} key={lineKey} keyIndex={lineKey} />
		)
		setLineContainers(lineContainerCopy)
		setCaretPosition({ 'lineNumber': lineIndex + 1, 'index': caretIndex + TAB_LENGTH });
		VerticalTraversalMode.current = false;
	}

	else if (keyCode === ARROW_LEFT) {
		e.preventDefault()
		if (lineIndex === 0 && caretIndex === 0)
			return

		if (caretIndex > 0) {
			const isTabCharacter = caretIndex >= TAB_LENGTH && lineText.slice(caretIndex - TAB_LENGTH, caretIndex) === TAB_CHARACTER;
			const sliceEndIndex = isTabCharacter ? caretIndex - TAB_LENGTH : caretIndex - 1;
			setCaretPosition({ 'lineNumber': lineIndex + 1, 'index': sliceEndIndex })
		}
		else {
			const previousLineTextLength = (lineContainer[lineIndex - 1].props.content || "").length;
			setCaretPosition({ 'lineNumber': lineIndex, 'index': previousLineTextLength })
		}

		VerticalTraversalMode.current = false;
	}

	else if (keyCode === ARROW_RIGHT) {
		e.preventDefault()
		if (lineIndex + 1 === lineContainer.length && caretIndex === lineText.length)
			return

		if (caretIndex < lineText.length) {
			const isTabCharacter = lineText.length - caretIndex >= TAB_LENGTH && lineText.slice(caretIndex, caretIndex + TAB_LENGTH) === TAB_CHARACTER;
			const sliceEndIndex = isTabCharacter ? caretIndex + TAB_LENGTH : caretIndex + 1;
			setCaretPosition({ 'lineNumber': lineIndex + 1, 'index': sliceEndIndex })
		}
		else
			setCaretPosition({ 'lineNumber': lineIndex + 2, 'index': 0 })
		VerticalTraversalMode.current = false;
	}

	else if (keyCode === ARROW_UP) {
		e.preventDefault()
		if (lineIndex === 0)
			return
		if (!VerticalTraversalMode.current) {
			VerticalTraversalIndex.current = caretIndex;
			VerticalTraversalMode.current = true;
		}
		const previousLineText = lineContainer[lineIndex - 1].props.content || "";
		setCaretPosition({ 'lineNumber': lineIndex, 'index': Math.min(VerticalTraversalIndex.current, previousLineText.length) })
	}

	else if (keyCode === ARROW_DOWN) {
		e.preventDefault()
		if (lineIndex + 1 === lineContainer.length)
			return

		if (!VerticalTraversalMode.current) {
			VerticalTraversalIndex.current = caretIndex;
			VerticalTraversalMode.current = true;
		}
		const nextLineText = lineContainer[lineIndex + 1].props.content || "";
		setCaretPosition({ 'lineNumber': lineIndex + 2, 'index': Math.min(VerticalTraversalIndex.current, nextLineText.length) })
	}

	else if (keyCode === DELETE) {
		const lineContainerCopy = lineContainer;
		const leftText = lineText.slice(0, caretIndex);
		const rightText = lineText.slice(caretIndex);
		if (caretIndex < lineText.length) {
			const isTabCharacter = lineText.length - caretIndex >= TAB_LENGTH && lineText.slice(caretIndex, caretIndex + TAB_LENGTH) === TAB_CHARACTER;
			const slicStartIndex = isTabCharacter ? TAB_LENGTH : 1;
			lineContainerCopy.splice(lineIndex, 1,
				<EditorCodeLine content={leftText + rightText.slice(slicStartIndex)} key={lineKey} keyIndex={lineKey} />)
			setLineContainers(lineContainerCopy)
			setCaretPosition({ 'lineNumber': lineIndex + 1, 'index': caretIndex });
		}

		else {
			if (lineIndex + 1 === lineContainer.length)
				return
			const nextLineText = lineContainer[lineIndex + 1].props.content || "";
			const newText = leftText + nextLineText;
			lineContainerCopy.splice(lineIndex, 2,
				<EditorCodeLine content={newText} key={lineKey} keyIndex={lineKey} />)
			setLineContainers(lineContainerCopy)
			setCaretPosition({ 'lineNumber': lineIndex + 1, 'index': leftText.length });
		}
		VerticalTraversalMode.current = false;
	}
}

const handleKeyboardShortcuts = (e, caretPosition, setLineContainers, setCaretPosition,
	lineContainer, nextCounterNumber, keyboardShortcuts) => {
	//e.preventDefault();
	const shortcut_code = ((e.altKey) ? 'a' : '' + (e.ctrlKey) ? 'c' : '' + (e.shiftKey) ? 's' : '') + '_' + e.key;
	const shortcut = keyboardShortcuts[shortcut_code];
	if (shortcut)
		shortcut.func()
}

export default handleKeyDown