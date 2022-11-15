import { useEffect, useState } from "react"
import {TextEditor} from "../components/TextEditor/index"

const HomePage = () => {
    const [selectedTheme, setSelectedTheme] = useState('Default')
    const [themeDropdownVisisble, setThemeDropdownVisible] = useState(false);

    const selectTheme = (e, themeName) => {
        setSelectedTheme(themeName);
        setThemeDropdownVisible(false);
    }

    const showThemeOptions = (e) => {
        e.target.focus();
        setThemeDropdownVisible(true);
    }

    const hideThemeOptions = (e) => {
        if (e.relatedTarget && e.relatedTarget.className === 'code-theme-dropdown-option')
            e.relatedTarget.click();
        setThemeDropdownVisible(false);
    }

    return (
        <div className="code-box">
            <div className="code-controls">
                <div>Theme</div>
                <div className='code-theme-dropdown'>
                    <div className='code-theme-droprown-value' tabIndex={0}
                        onClick={showThemeOptions}
                        onBlur={hideThemeOptions}>{selectedTheme}</div>

                    <div className={`code-theme-dropdown-options${themeDropdownVisisble ? ' visible' : ''}`}>
                        <div className='code-theme-dropdown-option' tabIndex={0} onClick={(e) => { selectTheme(e, 'Default') }}>
                            Default
                        </div>

                        <div className='code-theme-dropdown-option' tabIndex={0} onClick={(e) => { selectTheme(e, 'Light') }}>
                            Light
                        </div>


                        <div className='code-theme-dropdown-option' tabIndex={0} onClick={(e) => { selectTheme(e, 'Dark') }}>
                            Dark
                        </div>

                    </div>
                </div>
            </div>
            <TextEditor />
        </div>
    )
}

export default HomePage