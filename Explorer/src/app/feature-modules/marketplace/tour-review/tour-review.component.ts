import { Component, OnInit } from '@angular/core';
import { TourReview } from '../model/tour-review.model';
import { MarketplaceService } from '../marketplace.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model'; // Import the User model
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'xp-tour-review',
  templateUrl: './tour-review.component.html',
  styleUrls: ['./tour-review.component.css']
})
export class TourReviewComponent implements OnInit {

  tourReview: TourReview[] = [];
  shouldRenderTourReviewForm: boolean = false;
  shouldEdit: boolean = false;
  selectedTourReview: TourReview;
  userNames: { [key: number]: string } = {};
  showTable: boolean = false; // Initialize to hide the table
  currentUserId = this.authService.user$.value.id;
  tourId : string;

  constructor(private authService: AuthService, private service: MarketplaceService, private route: ActivatedRoute) { 

  }
  
  toggleTable() {
        this.showTable = !this.showTable;
  }
    
  onAddClicked(): void {
    this.shouldEdit = false;
    this.shouldRenderTourReviewForm = !this.shouldRenderTourReviewForm;
  }
  onEditClicked(tourReview: TourReview): void {
    this.selectedTourReview = tourReview;
    this.shouldRenderTourReviewForm = !this.shouldRenderTourReviewForm;
    this.shouldEdit = true;
  }


  ngOnInit() {
    this.route.params.subscribe(params => {
      const tourId = params['id']; // Extract the parameter value as string
      if (tourId) {
        this.tourId = tourId;
        this.getTourReviewByTourId(tourId); // Convert back to number if needed
      } else {
        // Handle the case when there is no valid tour ID in the URL.
      }
    });
  }
  
  

  loadUserNames(): void {
    if (!this.tourReview) {
      return;
    }
  
    const userObservables = this.tourReview.map((tourReview) =>
      this.authService.getUserById(tourReview.userId)
    );
  
    forkJoin(userObservables).subscribe((users: User[]) => {
      users.forEach((user, index) => {
        this.userNames[this.tourReview[index].userId] = user.username;
      });
    });
  }
  
  
  
  
  getTourReviewByTourId(tourId: string): void {
    this.service.getTourReviewByTourId(tourId).subscribe( tourReview => { 
      this.tourReview= tourReview;
      this.loadUserNames();
    },
    tourError => {
      console.error('Error tour review:', tourError);
    }
    );
  }
  

  async getTourReview(): Promise<void> {
    this.service.getTourReview().subscribe({
      next: (result: PagedResults<TourReview>) => {
        this.tourReview = result.results;
        this.loadUserNames(); // Load usernames for each review
      },
      error: () => {
        // Handle error if needed
      }
    });
  }

  

  deleteTourReview(id: string): void {
    if (this.tourId) {
      this.service.deleteTourReview(id).subscribe({
        next: () => {
          this.getTourReviewByTourId(this.tourId);
        },
        error: () => {
          // Handle error if needed
        }
      });
    } else {
      // Handle the case when this.tourId is not available
    }
  }
  

  getUserName(userId: number): string {
    if (this.userNames[userId]) {
      return this.userNames[userId];
    }
    return 'Nepoznato';
  }
}
