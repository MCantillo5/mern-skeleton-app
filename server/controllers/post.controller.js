import Post from '../models/post.model';
import merge from 'lodash/merge';
import errorHandler from './../helpers/dbErrorHandler';
import formidable from 'formidable';
import fs from 'fs';
import { extend } from 'lodash';
import defaultImage from './../../client/assets/images/profile-pic.png';
import { exec } from 'child_process';
import { error } from 'console';

const postById = async (req, res, next, id) => {
  try {
    let post = await Post.findById({ _id: id })
    .populate('comments', '_id name')
    .populate('likes', '_id name')
      .exec();

    if (!post) {
      return res.status(400).json({
        error: 'Post not found'
      });
    }
    req.profile = post;
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: 'Could not retrieve post'
    });
  }
};
const update = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtension = true;
  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        return res.status(400).json({
          error: 'Photo could not be uploaded'
        });
      }

      let post = req.profile;
      post = extend(post, fields);
      post.updated = Date.now();

      if (files.photo) {
        post.photo.data = fs.readFileSync(files.photo.filepath);
        post.photo.contentType = files.photo.types;
      }
      await post.save();
      post.hashed_password = '';
      post.salt = '';

      res.json({ post });
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage('error', err)
      });
    }
  });
};

const create = async (req, res) => {
  const post = new Post(req.body);
  try {
    await post.save();
    return res.status(200).json({
      message: 'Successfully signed up!'
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    });
  }
};

const addLike = async (req, res) => {
  try {
    const result = await Post.findByIdAndUpdate(
      req.body.postId,
      { $push: { likes: req.body.userId } },
      { new: true }
    )
    .populate('comments', '_id name')
    .populate('likes', '_id name')
      .exec();
    result.hashed_password = undefined;
    result.salt = undefined;
    res.json(result);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    });
  }
};

const like = async (req, res) => {
  try {
    const result = await Post.findByIdAndUpdate(req.body.postId, {
      $push: { likes: req.body.userId }
    }, { new: true });

    if (result) {
      return res.status(200).json(result);
    }
    return res.status(404).json({'data': 'Post with id not found'})
  } catch (error) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(error)
    })
  }
}

const addComment = async (req, res, next) => {
  try {
    await Post.findByIdAndUpdate(req.body.postId, {
      $push: { comments: req.body.CommentId }
    });
    next();
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    });
  }
};

const comment = async(req, res) => {
  let comment = req.body.comment;
  comment.postedBy = req.body.userId;
  try{
    let result=await Post.findByIdAndUpdate(
      req.body.postId, {$push:{comments:comment}},{new:true})
    .populate('comments.postedBy','_id name')
    .populate('postedBy','_id name')
    .exec();
    res.status(200).json(result);
  }catch(err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
      data: err
    });
  }
};

const uncomment = async (req, res)=>{
  let comment = req.body.comment;
  try{
    let result= await Post.findByIdAndUpdate(
      req.body.postIdm, {$pull:{comment:{_id:comment._id}}},{new:true}
    )
    .populate('comments.postedBy','_id name')
    .populate('postedBy','_id name')
    .exec();
    res.status(200).json(result);
  }catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    });
  }
};

const removeLike = async (req, res) => {
  try{
    const result = await Post.findByIdAndUpdate(
      req.body.postId,
      { $pull: { likes: req.body.userId}},
      { new: true}
    )
    .populate('comments', '_id name')
    .populate('likes', '_id name')
    .exec();
  res.json(result);
  }catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage()
    });
  }
};

const removeComment = async (req, res, next) =>{
  try{
    await Post.findByIdAndUpdate(
      req.body.postId,
      { $pull: { comments: req.body.uncommentId}});
      next();
    }catch (err){
      return res.status(400).json({
        error: errorHandler.getErrorMessage()
      });
    }
  };

const defaultPhoto = (req, res) =>{
  return res.sendFile(`${process.cwd()}${defaultImage}`);
};

const list = async (req, res) => {
  try {
    let posts = await Post.find().select('name post updated created');
    res.json(posts);
  } catch (err) {
    return res.status('400').json({
      error: errorHandler.getErrorMessage(err)
    })
  }
};

const read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  req.name = 'ss';
  return res.json(req.profile);
};

const remove = async (req, res, next) => {
  try {
    console.log('deleted');
    let post = req.profile;
    console.log('post to remove', post);
    let deletedPost = await post.deleteOne();
    deletedPost.hashed_password = '';
    deletedPost.salt = '';
    res.json(deletedPost);
  } catch(err) {
    console.log(err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    });
  }
};

export default {
  create,
  list,
  read,
  remove,
  postById,
  update,
  defaultPhoto,
  addLike,
  addComment,
  comment,
  uncomment,
  removeLike,
  removeComment,
  like
};
