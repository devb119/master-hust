import { paginate, create, all, getData, findById, update } from "./BaseService";
import { firestore } from "../config/firebase";
import { getNumberOfCommentsByPostId } from "./CommentService";

export async function getPosts(currentPage) {
  let query = all("posts");
  query = await paginate(query, currentPage);
  const data = getData(query);
  return data;
}

// export async function countPosts() {
//   let query = all("posts");
//   const numberOfPosts = await countRecords(query)
//   console.log(numberOfPosts)
//   return numberOfPosts
// }

export async function getPostById(id) {
  let data = await findById("posts", id);
  if (data.topicRef !== undefined) {
    const topicSnapshot = await data.topicRef.get();
    const topicData = topicSnapshot.data();
    data = { ...data, topic: topicData };
  }
  if (data.userRef !== undefined) {
    const userSnapshot = await data.userRef.get();
    const userData = userSnapshot.data();
    data = { ...data, user: userData };
  }
  const numberOfComment = await getNumberOfCommentsByPostId(id)
  data = { ...data, comment: numberOfComment }
  return data;
}

export async function getPostsByTopicId(topicId) {
  // Get the topic reference
  const topicRef = firestore.doc(`topics/${topicId}`);

  // Create a query to filter posts by topic reference
  const query = await all("posts").where("topicRef", "==", topicRef);

  const data = getData(query);
  return data;
}

export async function createPost({ title, content, image, topicId, userId }) {
  const topicRef = firestore.doc(`topics/${topicId}`)
  const userRef = firestore.doc(`users/${userId}`)
  const postData = {
    title: title,
    content: content, 
    image: image ? image : "A random image url",
    topicRef: topicRef,
    userRef: userRef,
    like: Math.floor(Math.random() * 101),
  }
  create("posts", postData);
}

export async function updatePost({ id, title, content, image, topicId }) {
  const topicRef = firestore.doc(`topics/${topicId}`)
  const postUpdateData = {
    title: title,
    content: content, 
    image: image ? image : "A random image url",
    topicRef: topicRef,
    like: Math.floor(Math.random() * 100),
  }
  update("posts", id, postUpdateData);
}

export async function getPostsWithInfo(currentPage) {
  const postsData = await getPosts(currentPage);
  return await Promise.all(
    postsData.map(async (post) => {
      let postWithInfo = { ...post };
      if (post.topicRef !== undefined) {
        const topicSnapshot = await post.topicRef.get();
        const topicData = topicSnapshot.data();
        postWithInfo = { ...postWithInfo, topic: topicData };
      }
      if (post.userRef !== undefined) {
        const userSnapshot = await post.userRef.get();
        const userData = userSnapshot.data();
        postWithInfo = { ...postWithInfo, user: userData };
      }
      const numberOfComment = await getNumberOfCommentsByPostId(post.id)
      postWithInfo = {...postWithInfo, comment: numberOfComment}
      return postWithInfo;
    })
  );
}
