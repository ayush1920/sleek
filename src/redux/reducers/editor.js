const initialState = {
    keyboardShortcuts: {},
}

const udpateReduxState = (state = initialState, action) =>{
    switch(action.type){
        case 'UPDATE_KEYBOARD_SHORTCUTS':{
            return {...state, keyboardShortcuts: {...state.keyboardShortcuts, ...action.value}}
        }
        default: {
            return state
        }
    }
}

export default udpateReduxState