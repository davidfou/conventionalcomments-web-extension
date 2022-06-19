import * as React from "react";

import AnnouncementContext from "../AnnouncementContext";

type AnnouncementProps = {
  announcement: string;
  children: JSX.Element;
};
function Announcement({
  announcement,
  children,
}: AnnouncementProps): JSX.Element | null {
  const [show, setShow] = React.useState<boolean | null>(null);
  const announcementContext = React.useContext(AnnouncementContext);
  React.useEffect(() => {
    if (show !== null) {
      return;
    }
    if (announcementContext.isLoading) {
      return;
    }
    const isShown = announcementContext.announcements.includes(announcement);
    setShow(isShown);
    if (isShown) {
      announcementContext.onRemoveAnnouncement(announcement);
    }
  }, [show, announcementContext, announcement]);

  return show === null || !show ? null : children;
}

export default Announcement;
