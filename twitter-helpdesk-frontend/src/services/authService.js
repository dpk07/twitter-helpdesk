import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";
// Register User
export const registerUser = (userData, history) => {
  axios
    .post("/users/register", userData)
    .then((res) => history.push("/login")) // re-direct to login on successful register
    .catch((err) => console.log(err));
};
// Login - get user token
export const loginUser = (userData) => {
  axios
    .post("/users/login", userData)
    .then((res) => {
      // Save to localStorage
      // Set token to localStorage
      const { token } = res.data;
      localStorage.setItem("jwtToken", token);
      // Set token to Auth header
      setAuthToken(token);
      // Decode token to get user data
      const decoded = jwt_decode(token);
      // Set current user
      window.location.href = "/list";
    })
    .catch((err) => console.log(err));
};
// Set logged in user
export const setCurrentUser = (decoded) => {
  localStorage.setItem("user", decoded);
};
// Log user out
export const logoutUser = () => {
  // Remove token from local storage
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("oauth_token");
  localStorage.removeItem("oauth_token_secret");
  localStorage.removeItem("screen_name");
  // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to empty object {} which will set isAuthenticated to false
  window.location.href = "/";
};
