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


const follow = (req, res) => { 
    // Smit trying to follow Saurav
    // this is smits token (accessToken)
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({"message":"Invalid Token"});
        }
        else {
            User.findOne({ username: decoded.username }, (err, user) => {
                if (err) {
                    res.status(500).json({"message":"Server Error"});
                }
                else if (!user) {
                    res.status(404).json({"message":"User not found"});
                }
                else {
                    if(req.params.id === user._id){
                        res.status(400).json({"message":"Cannot follow yourself"});
                        return;
                    }
                    // this is sauravs id from url ("req.params.id")
                    User.findById(req.params.id, (err, userToFollow) => {
                        if (err) {
                            res.status(500).json({"message":"Server Error"});
                        }
                        else if (!userToFollow) {
                            res.status(404).json({"message":"User not found"});
                        }
                        else {
                            if(user.following.includes(userToFollow.username)){
                                res.status(400).json({"message":"You are already following this user"});
                                return;
                            }
                            user.following.push(userToFollow.username);
                            userToFollow.followers.push(user.username);
                            user.save();
                            userToFollow.save();
                            res.status(200).json({"message":"Followed"});
                        }
                    });
                }
            });
        }
    })
}

const unfollow = (req, res) => {
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({"message":"Invalid Token"});
        }
        else {
            User.findOne({ username: decoded.username }, (err, user) => {
                if (err) {
                    res.status(500).json({"message":"Server Error"});
                }
                else if (!user) {
                    res.status(404).json({"message":"User not found"});
                }
                else {
                    User.findById(req.params.id, (err, userToUnfollow) => {
                        if (err) {
                            res.status(500).json({"message":"Server Error"});
                        }
                        else if (!userToUnfollow) {
                            res.status(404).json({"message":"User not found"});
                        }
                        else {
                            // user.following.push(userToFollow.username);
                            // userToFollow.followers.push(user.username);
                            if(!user.following.includes(userToUnfollow.username)){
                                res.status(400).json({"message":"You are not following this user"});
                                return;
                            }
                            user.following = user.following.filter((username) => username !== userToUnfollow.username);
                            userToUnfollow.followers = userToUnfollow.followers.filter((username) => username !== user.username);
                            user.save();
                            userToUnfollow.save();
                            res.status(200).json({"message":"Unfollowed"});
                        }
                    });
                }
            });
        }
    })
}

const userProfile = (req, res) => {
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({"message":"Invalid Token"});
        }
        else {
            User.findOne({ username: decoded.username }, (err, user) => {
                if (err) {
                    res.status(500).json({"message":"Server Error"});
                }
                else if (!user) {
                    res.status(404).json({"message":"User not found"});
                }
                else {
                    followersCount = user.followers.length;
                    followingCount = user.following.length;
                    const { username } = user;
                    res.status(200).json({
                        username,
                        followersCount,
                        followingCount
                    });
                }
            });
        }
    })
}

const deletePost = (req, res) => {
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({"message":"Invalid Token"});
        }
        else {
            Posts.findById(req.params.id, (err, post) => {
                if (err) {
                    res.status(500).json({"message":"Server Error"});
                }
                else if (!post) {
                    res.status(404).json({"message":"Post not found"});
                }
                else {
                    if (post.username === decoded.username) {
                        post.delete();
                        res.status(200).json({"message":"Post deleted"});
                    }
                    else {
                        res.status(401).json({"message":"Unauthorized"});
                    }
                }
            });
        }
    })
}

const getPost = (req, res) => {
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({"message":"Invalid Token"});
        }
        else {
            Posts.findById(req.params.id, (err, post) => {
                if (err) {
                    res.status(500).json({"message":"Server Error"});
                }
                else if (!post) {
                    res.status(404).json({"message":"Post not found"});
                }
                else {
                    if (post.username === decoded.username) {
                        data = {
                            id: post._id,
                            numberOfLikes: post.likedBy.length,
                            numberOfComments: post.comments.length,
                        }
                        res.status(200).json(data);
                    }
                    else {
                        res.status(401).json({"message":"Unauthorized"});
                    }
                }
            });
        }
    })
}

const like = (req, res) => {
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({"message":"Invalid Token"});
        }
        else {
            Posts.findById(req.params.id, (err, post) => {
                if (err) {
                    res.status(500).json({"message":"Server Error"});
                }
                else if (!post) {
                    res.status(404).json({"message":"Post not found"});
                }
                else {
                    if (post.likedBy.includes(decoded.username)) {
                        res.status(400).json({"message":"Already liked"});
                        return;
                    }
                    post.likedBy.push(decoded.username);
                    post.save();
                    res.status(200).json({"message":"Liked"});
                }
            });
        }
    })
}

const unlike = (req, res) => {
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({"message":"Invalid Token"});
        }
        else {
            Posts.findById(req.params.id, (err, post) => {
                if (err) {
                    res.status(500).json({"message":"Server Error"});
                }
                else if (!post) {
                    res.status(404).json({"message":"Post not found"});
                }
                else {
                    if(!post.likedBy.includes(decoded.username)){
                        return res.status(400).json({"message":"Bad Request"});
                    }
                    post.likedBy = post.likedBy.filter((username) => username !== decoded.username);
                    post.save();
                    res.status(200).json({"message":"Unliked"});
                }
            });
        }
    })
}

const addComment = (req, res) => {
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({"message":"Invalid Token"});
        }
        else {
            Posts.findById(req.params.id, (err, post) => {
                if (err) {
                    res.status(500).json({"message":"Server Error"});
                }
                else if (!post) {
                    res.status(404).json({"message":"Post not found"});
                }
                else {
                    const { comment } = req.body;
                    const commented = new Comment({
                        comment,
                        username: decoded.username,
                    });
                    commented.save((err, comment) => {
                        if (err) {
                            res.status(500).json({"message":"Server Error"});
                        }
                        else {
                            post.comments.push(comment._id);
                            post.save();
                            res.status(200).json({"comment_id": comment._id});
                        }
                    });
                }
            });
        }
    })
}

const all_posts = (req, res) => { 
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({"message":"Invalid Token"});
        }
        else {
            Posts.find({ username: decoded.username }).sort({ uploadTime: "desc" }).exec(async(err, posts) => {
                if (err) {
                    res.status(500).json({"message":"Server Error"});
                }
                else {
                    let data = [];
                    if(posts.length === 0){
                        return res.status(200).json({"message": "No Posts"});
                    }
                    for (let i = 0; i < posts.length; i++) {
                        let allComments = [];
                        for(let j=0; j<posts[i].comments.length; j++){
                            await Comment.findById(posts[i].comments[j])  // fetch all comments for each post
                            .then((comment) => {
                                allComments.push(comment.comment); //1st "comment" is of arg (obj of Comment Schema)
                            })                                     //2nd "comment" is  attribute of Comment Schema
                            .catch((err) => {
                                res.status(500).json({"message":"Server Error"});
                            });
                        }
                        //all data of one post
                        const newData = {
                            id: posts[i]._id,
                            title: posts[i].title,
                            description: posts[i].description,
                            numberOfLikes: posts[i].likedBy.length,
                            comments: allComments //all comments of one post
                    }
                    data.push(newData);
                }
                res.status(200).json(data);
            }
        });
    }
});
}

const addPost = (req, res) => {
    const accessToken = req.headers.authorization.split(" ")[1]; //assuming token is sent as Bearer <token>
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({"message":"Invalid Token"});
        }
        else {
            User.findOne({ username: decoded.username }, (err, user) => {
                if (err) {
                    res.status(500).json({"message":"Server Error"});
                }
                else if (!user) {
                    res.status(404).json({"message":"User not found"});
                }
                else {
                    const { title, description } = req.body;
                    const post = new Posts({
                        title,
                        description,
                        username: decoded.username,
                        uploadTime: new Date().getFullYear(),
                        likedBy: [],
                        comments: [],
                    });
                    post.save((err, post) => {
                        if (err) {
                            res.status(500).json({"message":"Server Error"});
                        }
                        else {
                            //include post ID in post
                            User.findOne({ username: decoded.username }, (err, user) => {
                                if (err) {
                                    res.status(500).json({"message":"Server Error"});
                                }
                                else if (!user) {
                                    res.status(404).json({"message":"User not found"});
                                }
                                else {
                                    user.posts.push(post._id);
                                    user.save();
                                    res.status(200).json(post);
                                }
                            });
                        }
                    });
                }
            });
        }
    })
}

const register = (req,res) => {
    const { username, password, email } = req.body;
    hashedPassword = bcrypt.hashSync(password, 10);
    const user = new User({
        username,
        password: hashedPassword,
        email,
        followers: [],
        following: [],
    });
    const accessToken = jwt.sign({username, email, password:hashedPassword}, process.env.JWT_SECRET);
    user.save((err, user) => {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.status(200).json({user, token: accessToken});
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