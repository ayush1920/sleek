import reducers from "./reducers/index";
import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({
    reducer: reducers,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});

export default store;