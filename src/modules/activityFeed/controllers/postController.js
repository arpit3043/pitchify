const { Post } = require("../models/postModel");
const { User } = require("../../auth/models/userModel");
const { Comment } = require("../models/commentModel");
const cloudinary=require('../../../utils/cloudinary')

/*
Route to create a post along with file upload if any.
*/
const createPost = async (req, res, next) => {
  try {
    const { author,content,hashtags }=req.body;
    const user= await User.findById(author);
    if(!user){
      return res.status(404).json({success:false,message:"User Not Found.Login Again!"});
    }

    //first we upload the media to cloudinary for fetching the urls(cloudinary)
    const mediaUrls=[]
    if(req.files && req.file.lenght>0){
      for(const file of req.files){
        const result =await cloudinary.uploader.upload(file.path,{
          folder:'posts_media',
          resource_type:'auto'
        });
        mediaUrls.push(result.secure_url);
      }
    }
    //create a new Post
    // const newPost = await Post.create(newPostData); not using this just for clarity
    const newPost=new Post({
      author,
      content,
      media:mediaUrls,
      hashtags:hashtags?hashtags.split(',').map(tag=>tag.trim()):[],
    });
    await newPost.save();    
    //add post id to the user object who created the post (ordering: latest first)
    user.posts.unshift(newPost._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Post created",
      post:newPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.stack,
    });
  }
};

/*
Route to fetch all the posts for the activity feed of any user.
For now the latest posts of it's followings are fetched.
*/
const fetchAllPost= async(req,res,next)=>{
    try{
      const {page=1,limit=10}=req.query;
      const userId=req.user.id;

      const user=await User.findById(userId);
      if(!user){
        return res.status(404).json({
          success:false,
          message:'User Not Found'
        });
      }
      const following =user.following|| [];
      //temp logic get the recent posts for all the users this user follows
      const postPromise=following.map(async (followingId)=>{
        const followingUser=await User.findById(followingId);
        if(followingUser && followingUser.posts.length>0){
          const latestPost=followingUser.posts[0];
          const post=await Post.findById(latestPost);
          return post;
        }
        return null;
      });

      const posts=await Promise.all(postPromise);
      //filtering out all the post=>null if any
      const validPosts=posts.filter(post=>post !== null);
      const startIndex=(page-1)*limit;
      const endIndex=page*limit;
      const paginatedPosts=validPosts.slice(startIndex,endIndex);
      return res.status(200).json({
        success:true,
        posts:paginatedPosts,
        pagination:{
          currentPage:page,
          totalPosts:validPosts.length,
          totalPages:Math.ceil(validPosts.length/limit),
        },
      });
    }catch(error){
      res.status(500).json({success:false,message:'Internal Server Error'});
    }
};

/*
Route to fetch a user post for a provided post id.
*/
const fetchPostById= async(req,res,next)=>{
  try{
    const post=await Post.findById(req.params.id);
    if(!post){
      return res.status(404).json({success:false,message:'Post Not Found'});
    }

    return res.status(200).json({
      success:true,
      message:'Post retrieval Success',
      post:post
    });
  }catch(error){
    res.status(500).json({success:false,message:'Internal Server Error'});
  }

};


/*
Route to update a user post for a provided post id.
*/
const updatePostById=async(req,res,next)=>{
    try{
      const updatesForPost=req.body;
      const post=await Post.findByIdAndUpdate(
        req.params.id,
        {$set:updatesForPost},
        {new:true,runValidators:true}
      );
      if(!post){
        return res.status(404).json({success:false,message:'Post Not Found'});
      }

      return res.status(200).json({
        success:true,
        message:'Post Update Successfully',
        post:post,
      });
    }catch(error){
      res.status(500).json({success:false,message:'Internal Server Error'});
    }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await post.deleteOne({ _id: req.params.id });

    const user = await User.findById(req.user._id);
    const indexOfPostInUser = user.posts.indexOf(req.params.id);
    user.posts.splice(indexOfPostInUser, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.stack,
    });
  }
};

const updatePostCaption = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    //unauthorized user accessing the post
    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized to Update",
      });
    }

    post.caption = req.body.caption;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post Updated",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.stack,
    });
  }
};

const commentOnPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "post not found",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { content } = req.body;
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    const newCommentData = {
      content,
      postId,
      owner: userId,
    };

    const comment = await Comment.create(newCommentData);

    post.comments.push(comment._id);

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Comment added",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    //check if comment belongs to the specified post
    if (!comment.postId.equals(postId)) {
      return res.status(400).json({
        success: false,
        message: "Comment does not belong to this post",
      });
    }

    //checking if user is owner of the comment or the post owner
    if (!comment.owner.equals(userId) && !post.owner.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to delete the comment",
      });
    }

    await Comment.findByIdAndDelete(commentId);
    post.comments.pull(commentId);
    await post.save();

    return res.status(200).json({
      success: true,
      message: "comment deleted",
      commentDeletedBy: userId,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCommentOnPost = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    //check if comment belongs to the specified post
    if (!comment.postId.equals(postId)) {
      return res.status(400).json({
        success: false,
        message: "Comment does not belong to this post",
      });
    }

    //checking if user is owner of the comment or the post owner
    if (!comment.owner.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to update the comment",
      });
    }

    const { content } = req.body;

    const updatedCommentData = {
      content,
    };
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      updatedCommentData,
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "comment Updated",
      updatedComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPost,
  deletePost,
  updatePostCaption,
  commentOnPost,
  deleteComment,
  updateCommentOnPost,
  fetchAllPost,
  fetchPostById,
  updatePostById,
};
