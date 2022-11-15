import { useState, useRef, useEffect} from "react"

const useBeautifier = () =>{
    const [isEnabled, setEnabled] = useState(true);
    const [highlightBrackets, setHighlightBrackets] = useState(true);
    const [autoIndeter, setAutoIndenter] = useEffect(true);
    
    const _bracketStack = useRef({});
    const _bracketStackKeys = useRef({});
    const bracketStack = _bracketStack.current
    const bracketStackKeys = _bracketStackKeys.current
    
    const updateBracketStack = (value) => {_bracketStack.current = value}
    const udpateBracketStackKeys = (value) => {_bracketStackKeys.current = value}
    
}