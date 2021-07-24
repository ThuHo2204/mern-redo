export const authReducer = (state, action) => {
    const{
        type,
        playload: { isAuthenticated, user}
    }= action
    
    switch (type) {
        case 'SET_AUTH':
            return{
                ...state,
                authLoading: false,
                isAuthenticated,
                user
            }
            
        default:
            return state
    }
} 