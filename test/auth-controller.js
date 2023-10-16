const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");

const User = require("../models/user");
const AuthController = require("../controllers/auth");

describe("Auth Controller", function () {
  before(async function () {
    await mongoose.connect(process.env.MONGODB_URI_TEST);

    const user = new User({
      email: "test@test.com",
      password: "tester",
      name: "Test",
      posts: [],
      _id: "5c0f66b979af55031b34728a",
    });
    await user.save();
  });

  it("should throw an error with code 500 if accessing the database fails", async function () {
    sinon.stub(User, "findOne");
    User.findOne.throws();

    const req = {
      body: {
        email: "test@test.com",
        password: "tester",
      },
    };

    try {
      await AuthController.login(req, {}, () => {});
    } catch (error) {
      expect(error).to.be.an("error");
      expect(error.statusCode).to.equal(500);
    } finally {
      User.findOne.restore();
    }
  });

  it("should send a response with a valid user status for an existing user", async function () {
    const req = { userId: "5c0f66b979af55031b34728a" };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.userStatus = data.status;
      },
    };

    await AuthController.getUserStatus(req, res, () => {});

    expect(res.statusCode).to.equal(200);
    expect(res.userStatus).to.equal("I am new");
  });

  after(async function () {
    await User.deleteMany();
    await mongoose.disconnect();
  });
});
