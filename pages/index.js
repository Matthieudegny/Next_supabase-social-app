import Layout from "../components/Layout";
import PostFormCard from "../components/PostFormCard";
import PostCard from "../components/PostCard";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import LoginPage from "./login";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../contexts/UserContext";

export default function Home() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [posts, setPosts] = useState([]);

  const { setProfile, triggerFetchUser } = useContext(UserContext);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchUser();
  }, [session?.user?.id, triggerFetchUser]);

  const fetchUser = () => {
    //Returns the user's datas, if there is an active session.
    if (!session?.user?.id) {
      return;
    }
    supabase
      .from("profiles")
      .select()
      .eq("id", session.user.id)
      .then((result) => {
        console.log("from profiles", result);
        if (result.data.length) {
          setProfile(result.data[0]);
        }
      });
  };

  const fetchPosts = () => {
    supabase
      .from("posts")
      //profiles(id...) is a reference for the table profiles -> post.is = foreign key // profiles.id = primary key
      .select("id, content, created_at, photos, profiles(id, avatar, name)")
      //the posts with parent null are the main posts, parent !null are post as comment of the main post
      .is("parent", null)
      .order("created_at", { ascending: false })
      .then((result) => {
        console.log("posts", result);
        setPosts(result.data);
      });
  };

  if (!session) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <PostFormCard onPost={fetchPosts} />
      {posts?.length > 0 &&
        posts.map((post) => (
          <PostCard key={post.id} fetchPosts={fetchPosts} {...post} />
        ))}
    </Layout>
  );
}
