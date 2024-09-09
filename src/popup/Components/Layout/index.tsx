import * as React from "react";
import LayoutComponent from "./Layout";
import Intro from "../Intro";
import ConfigureDomains from "../ConfigureDomains";
import AnnouncementContext, { State } from "../../AnnouncementContext";
import { getAnnouncements, removeAnnouncement } from "../../requests";

function Layout(): JSX.Element {
  const [announcements, setAnnouncements] = React.useState<string[] | null>(
    null
  );
  React.useEffect(() => {
    getAnnouncements().then((data) => {
      setAnnouncements(data.announcements);
    });
  }, []);
  const value = React.useMemo((): State => {
    if (announcements === null) {
      return { isLoading: true };
    }
    return {
      isLoading: false,
      announcements,
      onRemoveAnnouncement: (announcementToRemove: string) => {
        removeAnnouncement(announcementToRemove);
        setAnnouncements(
          announcements.filter(
            (announcement) => announcement !== announcementToRemove
          )
        );
      },
    };
  }, [announcements]);
  return (
    <AnnouncementContext.Provider value={value}>
      <LayoutComponent>
        <Intro />
        <ConfigureDomains />
      </LayoutComponent>
    </AnnouncementContext.Provider>
  );
}

export default Layout;
