import React, { Component } from "react";
import TwitterLoginAuth from "react-twitter-auth";
import openSocket from "socket.io-client";
import List from "../list/List";
import { getMentions } from "../../services/twitterService";
class TwitterLogin extends Component {
  constructor() {
    super();
    this.socket = null;
    this.state = { isAuthenticated: false, user: null, token: "", tweets: [] };
    this.tweetsMap = new Map();
  }
  componentWillUnmount() {
    this.socket.disconnect();
    this.socket = null;
  }

  onSuccess = (response) => {
    debugger;
    console.log(response);
    response.json().then((res) => {
      debugger;
      console.log(res);
      this.setState({ isAuthenticated: true });
      localStorage.setItem("oauth_token", res.oauth_token);
      localStorage.setItem("oauth_token_secret", res.oauth_token_secret);
      localStorage.setItem("screen_name", res.screen_name);
      getMentions().then((data) => {
        data.map((newTweet) => this.tweetsMap.set(newTweet.id, newTweet));
        data.map(this.handleTweet);
      });
      if (this.socket == null) {
        this.socket = openSocket("/", {
          query: {
            screenName: res.screen_name,
          },
          transports: ["websocket"],
          upgrade: false,
        });
        this.socket.on("tweet", this.handleTweetFromStream);
      }
    });
  };
  handleTweetFromStream = (newTweet) => {
    console.log(newTweet);
    this.tweetsMap.set(newTweet.id, newTweet);
    let tweets = this.state.tweets;
    if (!newTweet.in_reply_to_status_id) tweets.unshift(newTweet);
    else {
      let parentTweet = this.tweetsMap.get(newTweet.in_reply_to_status_id);
      if (parentTweet)
        if (parentTweet.replies) {
          parentTweet.replies.push(newTweet);
        } else {
          parentTweet.replies = [newTweet];
        }
    }
    this.setState({ tweets }, () => console.log("state", this.state));
  };

  handleTweet = (newTweet) => {
    console.log(newTweet);
    this.tweetsMap.set(newTweet.id, newTweet);
    let tweets = this.state.tweets;
    if (!newTweet.in_reply_to_status_id) tweets.push(newTweet);
    else {
      let parentTweet = this.tweetsMap.get(newTweet.in_reply_to_status_id);
      if (parentTweet)
        if (parentTweet.replies) {
          parentTweet.replies.push(newTweet);
        } else {
          parentTweet.replies = [newTweet];
        }
    }
    this.setState({ tweets }, () => console.log("state", this.state));
  };
  onFailed = (error) => {
    alert(error);
  };

  render() {
    let content = !!this.state.isAuthenticated ? (
      <div>
        <List tweets={this.state.tweets}></List>
      </div>
    ) : (
      <div>
        <TwitterLoginAuth
          loginUrl="/auth/twitter"
          onFailure={this.onFailed}
          onSuccess={this.onSuccess}
          requestTokenUrl="/auth/twitter/reverse"
          style={{ marginTop: "3rem" }}
        />
      </div>
    );

    return <div className="App">{content}</div>;
  }
}

export default TwitterLogin;
