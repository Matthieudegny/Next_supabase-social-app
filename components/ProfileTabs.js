import Link from "next/link";

export default function ProfileTabs({ userId, active }) {
  const tabClasses = "flex gap-1 px-4 py-1 items-center border-b-4 border-b-white";
  const activeTabClasses =
    "flex gap-1 px-4 py-1 items-center border-socialBlue border-b-4 text-socialBlue font-bold";
  return (
    <div className="mt-4 md:mt-10 flex gap-0">
      <Link href={`/profile/${userId}/posts`} className={active === "posts" ? activeTabClasses : tabClasses}>
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
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        <span className="hidden sm:block">Posts</span>
      </Link>
      {/* <Link
        href={`/profile/${userId}/about`}
        className={active === "about" ? activeTabClasses : tabClasses}
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
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
        <span className="hidden sm:block">About</span>
      </Link> */}
    </div>
  );
}
