import { Component, EventEmitter, OnInit } from '@angular/core';
import { BlogService } from '../blog.service';
import { Router } from '@angular/router';
import { Blog, BlogStatus } from '../model/blog.model';
import { ActivatedRoute } from '@angular/router';
import { BlogComment } from '../model/blog-comment.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Rating } from '../model/blog-rating.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Observable } from 'rxjs';
import { TourAuthoringService } from '../../tour-authoring/tour-authoring.service';
import { AdministrationService } from '../../administration/administration.service';
import { Checkpoint } from '../../tour-authoring/model/checkpoint.model';
import { Equipment } from '../../tour-authoring/model/equipment.model';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'xp-blog-single-post',
  templateUrl: './blog-single-post.component.html',
  styleUrls: ['./blog-single-post.component.css']
})



export class BlogSinglePostComponent implements OnInit {
  blogPost: Blog;
  blogSinglePost: BlogSinglePostComponent;
  blogId: string;
  comments: BlogComment[] = [];
  rating: Rating;
  upvoted: boolean = false;
  downvoted: boolean = false;
  ratingCount: number = 0;
  ratingCountUpdated = new EventEmitter<number>();
  similarBlogs: Blog[] = [];
  checkpoints: Checkpoint[]
  equipment: Equipment[]
  touristDistance: number=0;
  votes: Rating[];

constructor(private blogService: BlogService, private route: ActivatedRoute, private authService: AuthService, 
  private router: Router, private tourService: TourAuthoringService, private equipmentService: AdministrationService, private viewportScroller: ViewportScroller) { }


ngOnInit(): void {

  this.route.paramMap.subscribe((params) => {
    const blogId = params.get('id');
    if (blogId) {
      this.blogId = blogId;
      this.blogService.getBlog(this.blogId).subscribe((data: Blog) => {
        this.blogPost = data;
       // this.getCommentsByBlogId(this.blogId);
       if (blogId) {
        this.getCommentsByBlogId(this.blogId);
        this.blogService.getRatingCount(this.blogId).subscribe((ratingCount) => {
          this.ratingCount = ratingCount;
          this.blogService.getSimilarBlogs(this.blogPost).subscribe((similarBlogs: Blog[]) => {
          this.similarBlogs = similarBlogs;
        });
            this.votes = this.blogPost.votes || [];
            const userId = this.authService.user$.value.id;
            const userVote = this.votes.find(vote => vote.userId === userId);
            if(userVote){
              if(userVote.isUpvote == true){
                this.upvoted = true;
              }else{
                this.downvoted = true;
              }
            }
        
        if(this.blogPost.tourReport){
          this.touristDistance = this.blogPost.tourReport.length;
          this.tourService.getCheckpointsByVisitedCheckpoints(this.blogPost.tourReport.checkpointsVisited).subscribe({
            next: (result: PagedResults<Checkpoint>) =>{
              this.checkpoints = result.results;
            }
          })
          this.equipmentService.getEquipmentByIdsTourist(this.blogPost.tourReport.equipment).subscribe({
            next: (result: PagedResults<Equipment>) =>{
              this.equipment = result.results;
            }
          })
        }
      });
      } else {
        // Handle the case when there is no valid tour ID in the URL.
      }
      });
    }
  });
  }
  async getCommentsByBlogId(blogId: string): Promise<void> {
    try {
      const result = await this.blogService.getCommentsByBlogId(blogId).toPromise();
  
      if (result && Array.isArray(result) && result.length > 0) {
  
        
        const firstReview = result[0];
  
        
        this.comments = result;
  
        
      } else {
        console.error('Invalid response format: Tour review data is unavailable.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  updateRatingCount() {
    this.blogService.getRatingCount(this.blogId).subscribe((ratingCount) => {
      this.ratingCount = ratingCount;
      this.ratingCountUpdated.emit(ratingCount);
    });
  }

  

  upvoteClick() {
    let blog$: Observable<Blog> = this.blogService.getBlog(this.blogId); // Prilagodite ovaj poziv prema vašem servisu

      blog$.subscribe((blog: Blog) => {
        if (blog.status == BlogStatus.Closed) {
          // Blog je zatvoren, ne dozvoljavajte dodavanje komentara
          return;
        }
        else{
          const userId = this.authService.user$.value.id;
          this.upvoted = true;
          this.downvoted = false;
          const rating: Rating = {
            isUpvote: true,
            userId: userId,
            creationTime: new Date()
          };

          this.blogService.getAllVotes(this.blogId).subscribe((votes) => {
            const userId = this.authService.user$.value.id;
            const userVote = votes.find(vote => vote.userId === userId);
            if(userVote && userVote.isUpvote == false){
              const upvote: Rating = {
                isUpvote: true,
                userId: userVote.userId,
                creationTime: new Date(),
                id: userVote.id
              };
              let index = votes.findIndex(vote => vote.id === userVote.id);
              this.blogService.updateRating(upvote, this.blogId, index).subscribe({
                next: () => {
                  this.updateRatingCount();
                  this.upvoted = true;
                  this.downvoted = false;
                },
                error: (error) => {
                  // Obrada greške
                }
              });
            }else if(!userVote){
              this.blogService.addRating(rating, this.blogId).subscribe({
                next: () => {
                  this.updateRatingCount();
                  this.upvoted = true;
                  this.downvoted = false;
                },
                error: (error) => {
                  // Obrada greške
                }
              });
            }
        });
      
        }
      })
    
      
  }

  downvoteClick() {

    let blog$: Observable<Blog> = this.blogService.getBlog(this.blogId); // Prilagodite ovaj poziv prema vašem servisu

      blog$.subscribe((blog: Blog) => {
        if (blog.status == BlogStatus.Closed) {
          // Blog je zatvoren, ne dozvoljavajte dodavanje komentara
          return;
        }
        else{
          const userId = this.authService.user$.value.id;
          const rating: Rating = {
            isUpvote: false,
            userId: userId,
            creationTime: new Date()
          };

          this.blogService.getAllVotes(this.blogId).subscribe((votes) => {
            const userId = this.authService.user$.value.id;
            const userVote = votes.find(vote => vote.userId === userId);
            if(userVote && userVote.isUpvote == true){
              const downvote: Rating = {
                isUpvote: false,
                userId: userVote.userId,
                creationTime: new Date(),
                id: userVote.id
              };
              let index = votes.findIndex(vote => vote.id === userVote.id);
              this.blogService.updateRating(downvote, this.blogId, index).subscribe({
                next: () => {
                  this.updateRatingCount();
                  this.upvoted = false;
                  this.downvoted = true;
                },
                error: (error) => {
                  // Obrada greške
                }
              });
            }else if(!userVote){
              this.blogService.addRating(rating, this.blogId).subscribe({
                next: () => {
                  this.updateRatingCount();
                  this.upvoted = false;
                  this.downvoted = true;
                },
                error: (error) => {
                  // Obrada greške
                }
              });
            }
        });
      
        }
      })
    
  }
/*
  upvoteClick() {
    let blog$: Observable<Blog> = this.blogService.getBlog(this.blogId);
  
    blog$.subscribe((blog: Blog) => {
      if (blog.status == BlogStatus.Closed) {
        // Blog je zatvoren, ne dozvoljavajte dodavanje komentara
        return;
      }
      
      // Provera glasova korisnika
      this.checkUserVote(this.authService.user$.value.id, true);
    });
  }
  
  downvoteClick() {
    let blog$: Observable<Blog> = this.blogService.getBlog(this.blogId);
  
    blog$.subscribe((blog: Blog) => {
      if (blog.status == BlogStatus.Closed) {
        // Blog je zatvoren, ne dozvoljavajte dodavanje komentara
        return;
      }
  
      // Provera glasova korisnika
      this.checkUserVote(this.authService.user$.value.id, false);
    });
  }
  
  checkUserVote(userId: number, isUpvote: boolean) {
    // Poziv servisa za dobavljanje svih glasova za dati blog
    this.blogService.getAllVotes(this.blogId).subscribe((votes: Rating[]) => {
      // Provera da li korisnik već ima glas za dati blog
      const userVote = votes.find(vote => vote.userId === userId);
  
      // Ako korisnik već ima glas
      if (userVote) {
        // Ako je korisnik već dao upvote, dozvoli mu da klikne na downvote
        if (userVote.isUpvote && !isUpvote) {
          // Dodaj novi glas (downvote)
          const rating: Rating = {
            isUpvote: isUpvote,
            userId: userId,
            blogId: this.blogId,
            creationTime: new Date()
          };
  
          this.blogService.addRating(rating).subscribe({
            next: () => {
              this.updateRatingCount();
              this.downvoted = true;
            },
            error: (error) => {
              // Obrada greške
            }
          });
        }
        // Ako je korisnik već dao downvote, dozvoli mu da klikne na upvote
        else if (!userVote.isUpvote && isUpvote) {
          // Dodaj novi glas (upvote)
          const rating: Rating = {
            isUpvote: isUpvote,
            userId: userId,
            blogId: this.blogId,
            creationTime: new Date()
          };
  
          this.blogService.addRating(rating).subscribe({
            next: () => {
              this.updateRatingCount();
              this.upvoted = true;
            },
            error: (error) => {
              // Obrada greške
            }
          });
        }
        // Ako je korisnik već dao isti glas kao i sadašnji klik, ne radi ništa
        else {
          return;
        }
      }
      // Ako korisnik nema glas, dodaj novi glas
      else {
        // Dodaj novi glas (upvote ili downvote)
        const rating: Rating = {
          isUpvote: isUpvote,
          userId: userId,
          blogId: this.blogId,
          creationTime: new Date()
        };
  
        this.blogService.addRating(rating).subscribe({
          next: () => {
            this.updateRatingCount();
          },
          error: (error) => {
            // Obrada greške
          }
        });
      }
    });
  }*/
  
  

  sendRating() {
    this.blogService.addRating(this.rating, this.blogId).subscribe(
      response => {
      },
      error => {
      }
    );
  }

  
  
  getBlogComment(): void {
    this.blogService.getBlogComment().subscribe({
      next: (result: PagedResults<BlogComment>) => {
        this.comments = result.results;
      },
      error: () => {
      }
    })
  }

  onReadMoreClicked(id: string){
    this.router.navigate(['blog-single-post', id]).then(() => {
      // Scroll na vrh stranice nakon navigacije
      this.viewportScroller.scrollToPosition([0, 0]);
    });
  }

  isTourReportDefined(blog: Blog | undefined){
    if(blog && blog.tourReport != undefined){
      return true;
    }
    return false;
  }

onCommentAdded(comment: BlogComment): void {
  this.comments.push(comment); 
  this.getCommentsByBlogId(this.blogId);
}


}

    