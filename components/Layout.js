import NavigationCard from "./NavigationCard";

export default function Layout({ children, hideNavigation }) {
  let rightColumnClasses = "";
  if (hideNavigation) {
    rightColumnClasses += "w-full";
  } else {
    rightColumnClasses += "mx-4 md:mx-0 md:w-9/12 md:ml-72";
  }

  return (
    <div className="md:flex mt-4  gap-6 md:ml-5% xl:ml-20% md:w-90% xl:w-60% mb-24 md:mb-0">
      {!hideNavigation && (
        <div className="fixed w-full bottom-0 md:top-0 md:mt-4 md:ml-2   md:w-64 -mb-5">
          <NavigationCard />
        </div>
      )}
      <div className={rightColumnClasses}>{children}</div>
    </div>
  );
}
