import Card from "./Card";
import Avatar from "./Avatar";
import { useContext, useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { UserContext } from "../contexts/UserContext";
import Preloader from "./Preloader";

export default function PostFormCard({ onPost }) {
  const [content, setContent] = useState("");
  const [uploads, setUploads] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = useSupabaseClient();
  //session.user.id
  const session = useSession();
  const { profile } = useContext(UserContext);

  //get info from the user
  useEffect(() => {
    console.log("session", session.user.id);
    supabase
      .from("profiles")
      .select()
      //eq = match
      .eq("id", session.user.id)
      .then((result) => {
        // console.log(result);
      });
  }, []);

  function createPost() {
    supabase
      //table posts
      //the policy for this table is set as author = auth.uid()
      .from("posts")
      .insert({
        author: session.user.id,
        content,
        photos: uploads,
      })
      .then((response) => {
        if (!response.error) {
          setContent("");
          setUploads([]);
          if (onPost) {
            onPost();
          }
        } else {
          console.log("response false", response);
        }
      });
  }

  async function addPhotos(ev) {
    const files = ev.target.files;
    if (files.length > 0) {
      setIsUploading(true);
      for (const file of files) {
        const newName = Date.now() + file.name;
        const result = await supabase.storage
          .from("photos")
          .upload(newName, file)
          .then((result) => {
            console.log("result", result);
            const url =
              //.env + url to the supabase storage
              process.env.NEXT_PUBLIC_SUPABASE_URL +
              "/storage/v1/object/public/photos/" +
              result.data.path;
            setUploads((prevUploads) => [...prevUploads, url]);
          });
        if (result?.data) {
          const url =
            //.env + url to the supabase storage
            process.env.NEXT_PUBLIC_SUPABASE_URL +
            "/storage/v1/object/public/photos/" +
            result.data.path;
          setUploads((prevUploads) => [...prevUploads, url]);
        } else {
          console.log("error add photo", result);
        }
      }
      setIsUploading(false);
    }
  }

  return (
    <Card>
      <div className="flex gap-2 items-center">
        <div>
          <Avatar url={profile?.avatar} />
        </div>
        {profile && (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="grow p-3 h-14"
            placeholder={`Whats on your mind, ${profile?.name}?`}
          />
        )}
      </div>
      {isUploading && (
        <div>
          <Preloader />
        </div>
      )}
      {uploads.length > 0 && (
        <div className="flex gap-2">
          {uploads.map((upload) => (
            <div className="mt-2">
              <img src={upload} alt="" className="w-auto h-24 rounded-md" />
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-5 items-center mt-2">
        <div>
          <label className="flex gap-1">
            <input
              type="file"
              className="hidden"
              multiple
              onChange={addPhotos}
            />
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
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <span className="hidden md:block">Photos</span>
          </label>
        </div>
        <div className="grow text-right">
          <button
            onClick={createPost}
            className="bg-socialBlue text-white px-6 py-1 rounded-md"
          >
            Share
          </button>
        </div>
      </div>
    </Card>
  );
}
