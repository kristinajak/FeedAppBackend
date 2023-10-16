const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");

const User = require("../models/user");
const FeedController = require("../controllers/feed");

require("dotenv").config();

describe("Feed Controller", function () {
  let savedUser;
  before(async function () {
    await mongoose.connect(process.env.MONGODB_URI_TEST);

    const user = new User({
      email: "test@test.com",
      password: "tester",
      name: "Test",
      posts: [],
      _id: "5c0f66b979af55031b34728a",
    });
    savedUser = await user.save();
  });

  it("should add a created post to the posts of the creator", async function () {
    const req = {
      body: {
        title: "Test Post",
        content: "Test content",
      },
      file: {
        path: "abc",
      },
      userId: "5c0f66b979af55031b34728a",
    };
    const res = {
      status: function () {
        return this;
      },
      json: function () {},
    };

    await FeedController.createPost(req, res, () => {});
    const updatedUser = await User.findById("5c0f66b979af55031b34728a");
    expect(updatedUser).to.have.property("posts");
    expect(updatedUser.posts).to.have.length(1);
  });

  after(async function () {
    await User.deleteMany();
    await mongoose.disconnect();
  });
});
