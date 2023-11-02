import express from 'express';
import postCtrl from '../controllers/post.controller';
import authCtrl from '../controllers/auth.controller';

const router = express.Router();

router.route('/api/posts')
.get(postCtrl.list)
.post(postCtrl.create);

router.route('/api/posts/defaultphoto')
.get(postCtrl.defaultPhoto);

router
  .route('/api/posts/likes')
  .put(
    authCtrl.requireSignin,
    postCtrl.addComment,
    postCtrl.addLike,
    postCtrl.removeLike,);
  
router
  .route('/api/posts/comments')
  .put(
    authCtrl.requireSignin,
    postCtrl.comment
  );

router
    .route('/api/posts/like')
    .post(postCtrl.like)

  router.route('/api/posts/:postId')
  .get(authCtrl.requireSignin, postCtrl.read)
  .put(authCtrl.requireSignin, authCtrl.hasAuthorization, postCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, postCtrl.remove);

  router.param('postId', postCtrl.postById);

  export default router;