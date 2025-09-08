// import type { OutputData } from '@editorjs/editorjs';

export type Tagtype = {
  id: string;
  name: string;
};

export type Blogtype = {
  id: string;
  title: string;
  content: any;
  createdAt: string;
  coverimage?: string;
  views?: number;
  comments?: any[];
  author?: {
    name: string;
  };
};

export interface CommentType {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}


export interface SignupResponse {
  token: string;
}