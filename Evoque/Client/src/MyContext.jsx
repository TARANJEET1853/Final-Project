import { createContext } from 'react';

const MyContext = createContext({
    isLogin: false,
    setIsLogin: () => {},
});

export default MyContext;