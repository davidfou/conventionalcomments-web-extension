import * as React from "react";

export type State =
  | { isLoading: true }
  | {
      isLoading: false;
      announcements: string[];
      onRemoveAnnouncement: (announcement: string) => void;
    };

const AnnouncementContext = React.createContext<State>({ isLoading: true });

export default AnnouncementContext;
