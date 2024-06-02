import { Component, Input, OnInit } from '@angular/core';
import { BlogService } from '../blog.service';
import { BlogComment } from '../model/blog-comment.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { Blog } from '../model/blog.model';


@Component({
  selector: 'xp-comments-review',
  templateUrl: './comments-review.component.html',
  styleUrls: ['./comments-review.component.css']
})
export class CommentsReviewComponent implements OnInit {
  @Input() comments: BlogComment[] = [];
  blogId : string;
  selectedBlogComment: BlogComment | null;
  selectedForDelete: BlogComment | null;
  shouldRenderBlogCommentForm: boolean = false;
  shouldEdit: boolean = false;
  userNames: { [key: number]: string } = {};
  currentUserId:number;
  blog: Blog;
  blogComments: Blog[];
  

  constructor(private blogService: BlogService, private route: ActivatedRoute, private authService: AuthService) { 

  }

  editedCommentText: string = '';

  onEditClicked(comment: BlogComment): void {
    this.selectedBlogComment = comment;
    this.editedCommentText = comment.text;
  }

  

  onSaveCommentEdit(comment: BlogComment): void {
    if (this.selectedBlogComment) {
      const updatedComment = { ...this.selectedBlogComment };
      updatedComment.text = this.editedCommentText;
      
      // Find the index of the selected comment in the local array
      const index = this.comments.indexOf(this.selectedBlogComment);
      // Call the service to update the comment on the server
      this.blogService.updateBlogComment(updatedComment, this.blog.id!, index).subscribe(() => {
          this.getBlogComment();
      });
    }
  }
  
  
      // Call the service to save the changes on the server
    

  

  onCancelEdit(): void {
    this.selectedBlogComment = null;
    this.editedCommentText = '';
  }

  ngOnInit(): void {
   
    this.route.params.subscribe(params => {
      const blogId = params['id']; // Ovo 'blogId' mora da se poklapa sa imenom parametra iz URL-a
      this.currentUserId = this.authService.user$.value.id;
      if (blogId) {
        this.getCommentsByBlogId(blogId);
        this.blogService.getBlog(blogId).subscribe((blog: Blog) => {
          // Once the blog is fetched, access its comments
          this.blog = blog;
        })
      } else {
        // Handle the case when there is no valid blog ID in the URL.
      }
    });
  }
  getTourReviewByTourId(tourId: number) {
    throw new Error('Method not implemented.');
  }
 

  getCommentsByBlogId(blogId: string): void {
    this.blogService.getBlog(blogId).subscribe((blog: Blog) => {
      // Once the blog is fetched, access its comments
      const result = blog.comments!.filter(comment => comment.text !== "");
     // const result = blog.comments;
    })
  }

  deleteBlogComment(comment: BlogComment): void {
    if (comment) {
      this.selectedForDelete = comment;
      this.blogService.deleteBlogComment(this.blog.id!, this.selectedForDelete.id!).subscribe({
        next: () => {
          this.getBlogComment();
        },
      })
    }
    
  }

  getBlogComment(): void {
    this.route.params.subscribe(params => {
      const blogId = params['id'];
      if (blogId) {
        this.blogService.getBlog(blogId).subscribe((blog: Blog) => {
          this.blog = blog;
          this.comments = blog.comments!;
        })
      } else {
        // Handle the case when there is no valid blog ID in the URL.
      }
    });
  }

 


}

