const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User, Posts, Comment } = require("../models/models");
const { BadRequestError, UnauthenticatedError, NotFoundError } = require("../errors")

const authenticateUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new NotFoundError("User not found");
    }
    const result = await bcrypt.compare(password, user.password);
    if (!result) {
        throw new UnauthenticatedError("Invalid Password");
    }
    const accessToken = jwt.sign({ username: user.username }, process.env.JWT_SECRET);
    res.status(200).json({ token: accessToken });
}



const follow = async (req, res) => {
    // Smit trying to follow Saurav
    // this is smits token (accessToken)
    const accessToken = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    if (!decoded) {
        throw new UnauthenticatedError("Invalid Token");
    }
    const user = await User.findOne({ username: decoded.username });
    if (!user) {
        throw new NotFoundError("User not found");
    }
    // console.log(req.params.id, user._id.valueOf());
    if (req.params.id === user._id.valueOf()) {
        throw new BadRequestError("Cannot follow yourself");
    }
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
        throw new NotFoundError("User not found");
    }
    if (user.following.includes(userToFollow.username)) {
        throw new BadRequestError("You are already following this user");
    }
    user.following.push(userToFollow.username);
    userToFollow.followers.push(user.username);
    await user.save();
    await userToFollow.save();
    res.status(200).json({ "message": "Followed" });
}

const unfollow = async (req, res) => {
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)
    if (!decoded) {
        throw new UnauthenticatedError("Invalid Token");
    }
    const user = await User.findOne({ username: decoded.username })
    if (!user) {
        throw new NotFoundError("User not found");
    }
    const userToUnfollow = User.findById(req.params.id)
    if (!userToUnfollow) {
        throw new NotFoundError("User not found");
    }
    // user.following.push(userToFollow.username);
    // userToFollow.followers.push(user.username);
    if (!user.following.includes(userToUnfollow.username)) {
        throw new BadRequestError("You are not following this user");
    }
    user.following = user.following.filter((username) => username !== userToUnfollow.username);
    userToUnfollow.followers = userToUnfollow.followers.filter((username) => username !== user.username);
    await user.save();
    await userToUnfollow.save();
    res.status(200).json({ "message": "Unfollowed" });
}


const userProfile = async (req, res) => {
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch (error) {
        throw new UnauthenticatedError("Invalid Token");
    }
    console.log(decoded)
    if (!decoded) {
        throw new UnauthenticatedError("Invalid Token");
    }
    const user = await User.findOne({ username: decoded.username });
    if (!user) {
        throw new NotFoundError("User not found");
    }
    const followersCount = user.followers.length;
    const followingCount = user.following.length;
    const { username } = user;
    res.status(200).json({
        username,
        followersCount,
        followingCount
    });
}




const deletePost = async (req, res) => {
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    if (!decoded) {
        throw new UnauthenticatedError("Invalid Token");
    }
    const post = await Posts.findById(req.params.id);
    if (!post) {
        throw new NotFoundError("Post not found");
    }
    if (post.username !== decoded.username) {
        throw new UnauthenticatedError("Unauthorized");
    }
    await post.delete();
    res.status(200).json({ "message": "Post deleted" });
}


const getPost = async (req, res) => {
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    if (!decoded) {
        throw new UnauthenticatedError("Invalid Token");
    }
    const post = await Posts.findById(req.params.id);
    if (!post) {
        throw new NotFoundError("Post not found");
    }
    if (post.username !== decoded.username) {
        throw new UnauthenticatedError("Unauthorized");
    }
    const data = {
        id: post._id,
        numberOfLikes: post.likedBy.length,
        numberOfComments: post.comments.length,
    };
    res.status(200).json(data);
}


const like = async (req, res) => {
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    if (!decoded) {
        throw new UnauthenticatedError("Invalid Token");
    }
    const post = await Posts.findById(req.params.id);
    if (!post) {
        throw new NotFoundError("Post not found");
    }
    if (post.likedBy.includes(decoded.username)) {
        throw new BadRequestError("Already liked");
    }
    post.likedBy.push(decoded.username);
    await post.save();
    res.status(200).json({ "message": "Liked" });
}


const unlike = async (req, res) => {
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    if (!decoded) {
        throw new UnauthenticatedError("Invalid Token");
    }
    const post = await Posts.findById(req.params.id);
    if (!post) {
        throw new NotFoundError("Post not found");
    }
    if (!post.likedBy.includes(decoded.username)) {
        throw new BadRequestError("Bad Request");
    }
    post.likedBy = post.likedBy.filter((username) => username !== decoded.username);
    await post.save();
    res.status(200).json({ "message": "Unliked" });
}


const addComment = async (req, res) => {
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    if (!decoded) {
        throw new UnauthenticatedError("Invalid Token");
    }
    const post = await Posts.findById(req.params.id);
    if (!post) {
        throw new NotFoundError("Post not found");
    }
    const { comment } = req.body;
    const commented = new Comment({
        comment,
        username: decoded.username,
    });
    await commented.save();
    post.comments.push(commented._id);
    await post.save();
    res.status(200).json({ "comment_id": commented._id });
}


const all_posts = async (req, res) => {
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    if (!decoded) {
        throw new UnauthenticatedError("Invalid Token");
    }
    const posts = await Posts.find({ username: decoded.username }).sort({ uploadTime: "desc" });
    if (posts.length === 0) {
        return res.status(200).json({ "message": "No Posts" });
    }
    let data = [];
    for (let i = 0; i < posts.length; i++) {
        let allComments = [];
        for (let j = 0; j < posts[i].comments.length; j++) {
            const comment = await Comment.findById(posts[i].comments[j]).catch((err) => {
                throw new CustomAPIError("Server Error");
            });
            allComments.push(comment.comment);
        }
        const newData = {
            id: posts[i]._id,
            title: posts[i].title,
            description: posts[i].description,
            numberOfLikes: posts[i].likedBy.length,
            comments: allComments
        };
        data.push(newData);
    }
    res.status(200).json(data);
}


const addPost = async (req, res) => {
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    if (!decoded) {
        throw new UnauthenticatedError("Invalid Token");
    }
    const user = await User.findOne({ username: decoded.username });
    if (!user) {
        throw new NotFoundError("User not found");
    }
    const { title, description } = req.body;
    const post = new Posts({
        title,
        description,
        username: decoded.username,
        uploadTime: new Date().getFullYear(),
        likedBy: [],
        comments: [],
    });
    try {
        const savedPost = await post.save();
        user.posts.push(savedPost._id);
        await user.save();
        res.status(200).json(savedPost);
    } catch (error) {
        throw new CustomAPIError("Server Error");
    }
}


const register = (req, res) => {
    const { username, password, email } = req.body;
    hashedPassword = bcrypt.hashSync(password, 10);
    const user = new User({
        username,
        password: hashedPassword,
        email,
        followers: [],
        following: [],
    });
    const accessToken = jwt.sign({ username, email, password: hashedPassword }, process.env.JWT_SECRET);
    user.save((err, user) => {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.status(200).json({ user, token: accessToken });
        }
    });
}

module.exports = {
    authenticateUser,
    follow,
    unfollow,
    userProfile,
    deletePost,
    getPost,
    like,
    unlike,
    addComment,
    all_posts,
    addPost,
    register
}