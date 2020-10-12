import Axios from "axios";
import axios from "axios";
export const replyToTweet = (tweet) => {
  const oauth_token = localStorage.getItem("oauth_token");
  const oauth_token_secret = localStorage.getItem("oauth_token_secret");
  const tweetData = {
    oauth_token,
    oauth_token_secret,
    tweet,
  };
  axios.post("/auth/twitter/reply", tweetData).then((data) => {
    console.log(data);
  });
};

export const getMentions = () => {
  const oauth_token = localStorage.getItem("oauth_token");
  const oauth_token_secret = localStorage.getItem("oauth_token_secret");
  const tweetData = {
    oauth_token,
    oauth_token_secret,
  };
  return axios
    .post("/auth/twitter/getRecentMentions", tweetData)
    .then((data) => data.data);
};

export const logout = () => {
  localStorage.removeItem("oauth_token");
  localStorage.removeItem("oauth_token_secret");
  this.setState({ isAuthenticated: false, token: "", user: null });
};
