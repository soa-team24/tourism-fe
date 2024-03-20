export interface TourReview {
    id?: string;
    grade: number;
    comment: string;
    images: string;
    userId: number;
    reviewDate: Date;
    visitDate: Date;
    tourId: string;
}