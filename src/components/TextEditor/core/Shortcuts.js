import {shortcutKeys} from "../../../core/commonShortcut";
import { undoEditor, redoEditor } from "./UndoRedo" 

export const EDITOR_SHORTCUTS  = [
    [shortcutKeys.CTRL, 'z', undoEditor],
    [shortcutKeys.CTRL, 'y', redoEditor],
]