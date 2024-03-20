export interface Rating {
    id? : string;
    isUpvote : boolean;
    userId : number;
    blogId : string;
    creationTime: Date;
}