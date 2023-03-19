import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { UserContextProvider } from "../contexts/UserContext";

export default function SavedPostsPage() {
  const [posts, setPosts] = useState([]);
  const session = useSession();
  const supabase = useSupabaseClient();
  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }
    supabase
      //i fetch all the post'ids saved
      .from("saved_posts")
      .select("post_id")
      .eq("user_id", session.user.id)
      .then((result) => {
        const postsIds = result.data.map((item) => item.post_id);
        //i fetch the posts saved thanks their ids
        supabase
          .from("posts")
          .select("*, profiles(*)")
          .in("id", postsIds)
          .then((result) => setPosts(result.data));
      });
  }, [session?.user?.id]);
  return (
    <Layout>
      <UserContextProvider>
        <h1 className="text-6xl mb-4 text-gray-300">Saved posts</h1>
        {posts.length > 0 &&
          posts.map((post) => (
            <div key={post.id}>
              <PostCard {...post} />
            </div>
          ))}
      </UserContextProvider>
    </Layout>
  );
}
