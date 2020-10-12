import React, { Component } from "react";
import { replyToTweet } from "../../services/twitterService";
import { logoutUser } from "../../services/authService";
let tweets = [];
for (let i = 0; i < 10; i++) {
  tweets.push({
    text: "Hi Hello,May I ask for a favor?",
    id: i,
    user: {
      profile_image_url_https:
        "https://pbs.twimg.com/profile_images/1315196104091357197/qw8li8wC_normal.jpg",
      name: "Deepak" + i,
      followers_count: 0,
      friends_count: 0,
      statuses_count: 49,
    },
    timestamp_ms: "1602420674815",
    replies: [
      {
        text: "Hi, Please tell me.",
        id: i,
        timestamp_ms: "1602420674815",
        user: {
          profile_image_url_https:
            "https://pbs.twimg.com/profile_images/1315196104091357197/qw8li8wC_normal.jpg",
          name: "Amazon" + i,
          followers_count: 0,
          friends_count: 0,
          statuses_count: 49,
        },
      },
    ],
  });
}

export default class List extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedTweet: null, reply: "" };
  }
  handleTweetClick = (tweet) => {
    this.setState({ selectedTweet: tweet });
  };
  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };
  handleEnterKey = (e) => {
    if (e.keyCode == 13) {
      // enter pressed
      debugger;
      try {
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);

        let { reply, selectedTweet } = this.state;
        let replyTweet = {
          status: reply + " @" + selectedTweet.user.screen_name,
          in_reply_to_status_id: "" + selectedTweet.id_str,
        };
        replyToTweet(replyTweet);
        console.log(replyTweet);
      } catch (err) {
        console.log(err.message);
      }
    }
  };
  handleLogout = () => {
    logoutUser();
  };
  render() {
    const { reply } = this.state;
    return (
      <div className="container">
        <div className="row marginBottom0">
          <h5 className="left conversationHeading">Conversations</h5>
          <h6
            className="right conversationHeading"
            style={{ cursor: "pointer" }}
            onClick={this.handleLogout}
          >
            Logout
          </h6>
        </div>
        <div className="row">
          <div className="col s3 parentWrapper">
            {renderParentTweets(this.props.tweets, this.handleTweetClick)}
          </div>

          <div className="col s9 conversationWrapper">
            <div class="row marginBottom0" style={{ height: "87vh" }}>
              <div className="col s8 leftContainer">
                <div className="row marginBottom0" style={{ height: "85%" }}>
                  {this.state.selectedTweet &&
                    renderUserInfo(this.state.selectedTweet.user)}
                  {renderChildTweets(this.state.selectedTweet)}
                </div>

                <div class="input-field col s6" style={{ width: "100%" }}>
                  <input
                    value={reply}
                    id="reply"
                    name="reply"
                    placeholder="Reply"
                    type="text"
                    class="validate"
                    onChange={this.handleChange}
                    onKeyUp={this.handleEnterKey}
                  />
                </div>
              </div>
              <div className="col s4">
                {this.state.selectedTweet &&
                  renderUser(this.state.selectedTweet.user)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
const renderUserInfo = (user) => {
  return (
    <div className="valign-wrapper marginBottom0 parentTweet">
      <div className="col s1 valign-wrapper">
        <img className="image" src={user.profile_image_url_https} />
      </div>
      <div className="col s11">
        <span className="left">{user.name}</span>
      </div>
    </div>
  );
};

const renderChildTweets = (tweet) => {
  if (!tweet) return;
  let tweets = [];
  tweets.push(tweet);
  const getReplies = (tweet) => {
    if (tweet.replies) {
      tweets.push(...tweet.replies);
      tweet.replies.map((reply) => getReplies(reply));
    }
  };
  getReplies(tweet);
  if (!tweets) return;
  tweets.sort((a, b) => {
    return new Date(a.created_at) - new Date(b.created_at);
  });
  console.log(tweets);
  return (
    <ul style={{ padding: "0.5rem" }}>
      {tweets.map((tweet) => {
        const gmtdate = new Date(tweet.created_at);
        const localDate = new Date(gmtdate.toLocaleString());
        const hours = localDate.getHours();
        const minutes = localDate.getMinutes();
        return (
          <div>
            <li key={tweet.id} className="parentTweet">
              <div className="row valign-wrapper marginBottom0">
                <div className="col s1 valign-wrapper">
                  <img
                    className="image"
                    src={tweet.user.profile_image_url_https}
                  />
                </div>
                <div className="col s9">
                  <span className="left left-align">{tweet.text}</span>
                </div>
                <div className="col s2">
                  <span className="left textGrey left-align">{`${hours}:${minutes}`}</span>
                </div>
              </div>
            </li>
            {/* {renderTweets(tweet.replies)} */}
          </div>
        );
      })}
    </ul>
  );
};

const renderParentTweets = (tweets, handleTweetClick) => {
  if (!tweets) return;
  return (
    <ul>
      {tweets.map((tweet) => (
        <div>
          <li
            onClick={() => handleTweetClick(tweet)}
            key={tweet.id}
            className="parentTweet"
          >
            <div className="row valign-wrapper marginBottom0">
              <div className="col s2 valign-wrapper">
                <img
                  className="image"
                  src={tweet.user.profile_image_url_https}
                />
              </div>
              <div className="col s10">
                <span className="left">{tweet.user.name}</span>
              </div>
            </div>
            <div className="row marginBottom0">
              <div className="col s10 push-s2">
                <span className="left textGrey left-align">{tweet.text}</span>
              </div>
            </div>
          </li>
          {/* {renderTweets(tweet.replies)} */}
        </div>
      ))}
    </ul>
  );
};

const renderUser = (user) => {
  return (
    <div className="container" style={{ marginTop: "1rem" }}>
      <div className="row marginBottom0">
        <img className="profileImage" src={user.profile_image_url_https} />
      </div>
      <div className="row marginBottom0">{user.name}</div>
      <div className="row marginBottom0">
        <table className="responsive-table">
          <tbody>
            <tr>
              <td>Followers</td>
              <td>{user.followers_count}</td>
            </tr>
            <tr>
              <td>Friends</td>
              <td>{user.friends_count}</td>
            </tr>
            <tr>
              <td>Statuses</td>
              <td>{user.statuses_count}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
