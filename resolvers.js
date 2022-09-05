import Post from "./models/Post.model.js";

const resolvers = {
  Query: {
    hello: () => {
      return "Hello World!";
    },

    getAllPosts: async () => {
      return await Post.find();
    },

    getPost: async (_, { id }) => {
      return await Post.findById(id);
    },
  },

  Mutation: {
    createPost: async (_, args) => {
      const { title, description } = args.post;
      const post = new Post({ title, description });

      await post.save();
      return post;
    },

    deletePost: async (_, { id }) => {
      await Post.findByIdAndDelete(id);
      return "Post successfully deleted";
    },

    updatePost: async (_, args) => {
      const { id } = args;
      const { title, description } = args.post;

      const updates = {};

      if (title !== undefined) {
        updates.title = title;
      }

      if (description !== undefined) {
        updates.description = description;
      }

      const newPost = await Post.findByIdAndUpdate(id, updates, { new: true });
      return newPost;
    },
  },
};

export default resolvers;
