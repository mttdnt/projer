export const setToken = token => {
    localStorage.setItem("prToken", token);
  };

  export const getToken = () => {
    return localStorage.getItem("prToken");
  };

  export const removeToken = () => {
    localStorage.removeItem("prToken");
  };