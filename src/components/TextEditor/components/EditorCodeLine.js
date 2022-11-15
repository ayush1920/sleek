import { useState, useEffect, useRef } from "react"
import PropTypes from 'prop-types'

const EditorCodeLine = (props) => {
    const { isActive} = props
    const className = (isActive) ? 'editor-line active' : 'editor-line'
    useEffect(() => {

    }, [isActive])

    return (
        <div className={className}>
            {props.content}
        </div>
    )
}

EditorCodeLine.defaultProps = {
    content: '',
    isActive: true,
    
}

EditorCodeLine.propTypes = {
    content: PropTypes.string,
    keyIndex: PropTypes.number,
}

export default EditorCodeLine