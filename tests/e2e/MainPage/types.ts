import { Product } from "../types";

interface Thread<T extends Product> {
  type: T;
}

interface Comments<T extends Product> {
  type: T;
}

interface GitHubThread extends Thread<"github"> {
  commentIds: number[];
}

interface GitHubComments extends Comments<"github"> {
  id: number;
  commentIds: number[];
}

interface GitLabThread extends Thread<"gitlab"> {
  id: string;
  noteIds: number[];
}

interface GitLabComments extends Comments<"gitlab"> {
  noteIds: string[];
}

type ThreadTypeByProduct = {
  github: GitHubThread;
  gitlab: GitLabThread;
};

export type ThreadMap = {
  [P in Product]: ThreadTypeByProduct[P];
};

type CommentsTypeByProduct = {
  github: GitHubComments;
  gitlab: GitLabComments;
};

export type CommentsMap = {
  [P in Product]: CommentsTypeByProduct[P];
};
