import Avatar from "./Avatar";
import Card from "./Card";
// import ClickOutHandler from "react-clickout-handler";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import ReactTimeAgo from "react-time-ago";
import { UserContext } from "@/contexts/UserContext";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

export default function PostCard({ id, content, created_at, photos, profiles, fetchPosts }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const supabase = useSupabaseClient();
  const { profile } = useContext(UserContext);

  //while waiting for the amount of the component and the fetch
  let profilId = profile ? profile.id : 0;
  let profilAvatar = profile ? profile.avatar : 0;
  let profilName = profile ? profile.name : 0;

  //session.user.id
  const session = useSession();
  useEffect(() => {
    fetchLikes();
    fetchComments();
    if (profilId) fetchIsSaved();
  }, [profilId]);

  const fetchIsSaved = () => {
    supabase
      .from("saved_posts")
      .select()
      .eq("post_id", id)
      .eq("user_id", profilId)
      .then((result) => {
        if (result.data.length > 0) {
          setIsSaved(true);
        } else {
          setIsSaved(false);
        }
      });
  };
  const fetchLikes = () => {
    supabase
      .from("likes")
      .select()
      .eq("post_id", id)
      .then((result) => setLikes(result.data));
  };
  const fetchComments = () => {
    supabase
      .from("posts")
      .select("*, profiles(*)")
      //i fetch only the comments from this post thanks the id
      .eq("parent", id)
      .then((result) => {
        setComments(result.data);
      });
  };
  const openDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(true);
  };

  const toggleSave = () => {
    if (isSaved) {
      supabase
        .from("saved_posts")
        .delete()
        .eq("post_id", id)
        .eq("user_id", profilId)
        .then((result) => {
          setIsSaved(false);
          setDropdownOpen(false);
        });
    }
    if (!isSaved) {
      supabase
        .from("saved_posts")
        .insert({
          user_id: profilId,
          post_id: id,
        })
        .then((result) => {
          setIsSaved(true);
          setDropdownOpen(false);
        });
    }
  };

  //if in the likes table compare if the like.user_id (the id ok the user who liked the picture) is the same than the user.id (user session)
  // !! -> return a boolean
  const isLikedByMe = !!likes.find((like) => like.user_id === profilId);

  const toggleLike = () => {
    if (isLikedByMe) {
      supabase
        .from("likes")
        .delete()
        .eq("post_id", id)
        .eq("user_id", profilId)
        .then((result) => {
          fetchLikes();
        });
      return;
    }
    supabase
      .from("likes")
      .insert({
        post_id: id,
        user_id: profilId,
      })
      .then((result) => {
        fetchLikes();
      });
  };

  const postComment = (ev) => {
    ev.preventDefault();
    supabase
      .from("posts")
      .insert({
        content: commentText,
        author: profilId,
        parent: id,
      })
      .then((result) => {
        fetchComments();
        setCommentText("");
      });
  };

  const deleteComment = (id) => {
    supabase
      .from("posts")
      .delete()
      .eq("id", id)
      .then((result) => {
        console.log("commentaire supprimé", result);
        fetchComments();
      });
  };

  const deletePost = (id) => {
    // Check if the post has been saved
    supabase
      .from("saved_posts")
      .delete()
      .eq("post_id", id)
      .then((savedPostsResult) => {
        console.log("saved_posts supprimés", savedPostsResult);

        // Check if the post has been commented
        supabase
          .from("posts")
          .delete()
          .eq("parent", id)
          .then((savedPostsResult) => {
            console.log("commentaires supprimés", savedPostsResult);

            // Check if the post has been liked is managed by the cascade
            // Delete the post
            supabase
              .from("posts")
              .delete()
              .eq("id", id)
              .then((postsResult) => {
                console.log("post supprimé", postsResult);
                fetchPosts();
              })
              .catch((error) => {
                console.error(error);
              });
          })
          .catch((error) => {
            console.error(error);
          });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    supabase
      .from("posts")
      .delete()
      .eq("id", 34)
      .then((savedPostsResult) => {
        console.log("tesssst commentaires supprimés", savedPostsResult);
      });
  }, []);

  //on click out -> close the menu
  useEffect(() => {
    const closeDropDownMenu = (e) => {
      setDropdownOpen(false);
    };
    document.body.addEventListener("click", closeDropDownMenu);
    return () => document.body.removeEventListener("click", closeDropDownMenu);
  }, []);

  return (
    <Card>
      <div className="flex gap-3">
        <div>
          <Link href={"/profile/" + profiles?.id}>
            <span className="cursor-pointer">
              <Avatar url={profiles?.avatar} />
            </span>
          </Link>
        </div>
        <div className="grow">
          <p>
            <Link href={"/profile/" + profiles?.id}>
              <span className="mr-1 font-semibold cursor-pointer hover:underline">{profiles?.name}</span>
            </Link>
            shared a post
          </p>
          <p className="text-gray-500 text-sm">
            <ReactTimeAgo date={new Date(created_at).getTime()} />
          </p>
        </div>
        <div>
          {dropdownOpen ? (
            <button className="text-gray-400" onClick={() => setDropdownOpen(false)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <button className="text-gray-400" onClick={openDropdown}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
            </button>
          )}
          {/* Menu card -> delete + save*/}
          <div className="relative">
            {dropdownOpen && (
              <div className="absolute -right-4 bg-white shadow-md shadow-gray-300 p-3 rounded-sm border border-gray-100 w-52 md:pt-6">
                <button onClick={toggleSave} className="w-full -my-2">
                  <span className="flex -mx-4 hover:shadow-md gap-3 py-2 my-2 hover:bg-socialBlue hover:text-white px-4 rounded-md transition-all hover:scale-110 shadow-gray-300">
                    {isSaved && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5"
                        />
                      </svg>
                    )}
                    {!isSaved && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                        />
                      </svg>
                    )}
                    {isSaved ? "Remove from saved" : "Save post"}
                  </span>
                </button>
                {session.user.id == profiles?.id ? (
                  <a
                    className="flex gap-3 py-2 my-2 cursor-pointer hover:bg-socialBlue hover:text-white -mx-4 px-4 rounded-md transition-all hover:scale-110 hover:shadow-md shadow-gray-300"
                    onClick={() => deletePost(id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                    Delete
                  </a>
                ) : (
                  ""
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <p className="my-3 text-sm">{content}</p>
        {photos?.length > 0 && (
          <div className="flex gap-4">
            {photos.map((photo) => (
              <div key={photo} className="">
                <img src={photo} className="rounded-md" alt="" />
              </div>
            ))}
          </div>
        )}
      </div>
      {/* section like and comment */}
      <div className="mt-5 flex gap-8">
        <button className="flex gap-2 items-center" onClick={toggleLike}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={"w-6 h-6 " + (isLikedByMe ? "fill-red-500" : "")}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          {likes?.length}
        </button>
        <button className="flex gap-2 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
          {comments.length}
        </button>
      </div>
      <div className="flex mt-4 gap-3 items-center">
        <div>
          <Avatar url={profilAvatar} />
        </div>
        <div className="border grow rounded-full">
          <form onSubmit={postComment}>
            <input
              value={commentText}
              onChange={(ev) => setCommentText(ev.target.value)}
              className="block w-full p-3 px-4 overflow-hidden h-12 rounded-full"
              placeholder="Leave a comment"
            />
          </form>
        </div>
      </div>

      <div>
        {comments.length > 0 &&
          comments.map((comment) => (
            <div key={comment.id} className="mt-2 flex gap-2 items-center">
              <Avatar url={comment.profiles.avatar} />
              <div className="bg-gray-200 py-2 px-4 rounded-3xl md:max-w-full md:ml-1">
                <div>
                  <Link href={"/profile/" + comment.profiles.id}>
                    <span className="hover:underline font-semibold mr-1">{comment.profiles.name}</span>
                  </Link>
                  <span className="text-sm text-gray-400">
                    <ReactTimeAgo timeStyle={"twitter"} date={new Date(comment.created_at).getTime()} />
                  </span>
                </div>
                <p className="text-sm text-ellipsis overflow-hidden max-w-prose">{comment.content}</p>
              </div>
              {session?.user.id == comment.profiles.id ? (
                <div>
                  <button className="text-gray-400" onClick={() => deleteComment(comment.id)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                ""
              )}
            </div>
          ))}
      </div>
    </Card>
  );
}
