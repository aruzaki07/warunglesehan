const initialState = {
    popup : 'false',
    isLogin : false,
    user: '',
    isLoading: false,
    menus: [],
    pesanan: {}
  }

const reducer = (state = initialState, action) => {
    if(action.type === 'CHANGE_POPUP'){
      return {
        ...state,
        popup: action.value
      }
    }
    
    if(action.type === 'CHANGE_ISLOGIN'){
      return {
        ...state,
        isLogin : action.value
      }
    }

    if(action.type === 'CHANGE_USER'){
        return {
          ...state,
          user : action.value
        }
      }

      if(action.type === 'CHANGE_LOADING'){
        return {
          ...state,
          isLoading : action.value
        }
      }

      if(action.type === 'SET_MENUS'){
        return {
          ...state,
          menus : action.value
        }
      }


      if(action.type === 'SET_PESANAN'){
        return {
          ...state,
          pesanan : action.value
        }
      }


    return state;
  }

  export default reducer;