const Post = require('../models/Post');

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('authorId', 'name username profilePhoto tags')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content, imageUrl } = req.body;
    
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const newPost = new Post({
      authorId: req.user.id,
      content,
      imageUrl: imageUrl || ''
    });

    await newPost.save();
    
    // Populate the newly created post so frontend can render it immediately
    const populatedPost = await Post.findById(newPost._id).populate('authorId', 'name username profilePhoto tags');
    
    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: 'Error creating post' });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user.id;
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json({ message: 'Like toggled', likes: post.likes });
  } catch (err) {
    res.status(500).json({ message: 'Error toggling like' });
  }
};
