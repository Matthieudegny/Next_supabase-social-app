import PostCard from "./PostCard";
import Card from "./Card";
import FriendInfo from "./FriendInfo";
import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function ProfileContent({ activeTab, userId, infoUSer }) {
  const [posts, setPosts] = useState([]);
  const supabase = useSupabaseClient();
  useEffect(() => {
    if (!userId) {
      return;
    }
    if (activeTab === "posts") {
      // loadPosts();
      fetchPosts();
    }
  }, [userId, activeTab]);

  async function loadPosts() {
    const posts = await userPosts(userId);
    console.log("posts", posts);
    setPosts(posts);
  }

  // async function userPosts(userId) {
  //   const { data } = await supabase
  //     .from("posts")
  //     .select("id, content, created_at, author,photos")
  //     .eq("author", userId);
  //   return data;
  // }
  const fetchPosts = () => {
    supabase
      .from("posts")
      //profiles(id...) is a reference for the table profiles -> post.is = foreign key // profiles.id = primary key
      .select("id, content, created_at, photos, profiles(id, avatar, name)")
      .eq("author", userId)
      //the posts with parent null are the main posts, parent !null are post as comment of the main post
      .is("parent", null)
      .order("created_at", { ascending: false })
      .then((result) => {
        setPosts(result.data);
      });
  };

  return (
    <div>
      {activeTab === "posts" && (
        <div>
          {posts?.length > 0 &&
            posts.map((post) => (
              <>
                <PostCard key={post.created_at} infoUSer={infoUSer} {...post} />
              </>
            ))}
        </div>
      )}
    </div>
  );
}
