import { Component, OnInit } from '@angular/core';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Tour } from '../model/tour.model';
import { TourAuthoringService } from '../tour-authoring.service';
import { ShoppingCart } from '../../marketplace/model/shopping-cart.model';
import { AuthService } from '../../../infrastructure/auth/auth.service'; 

@Component({
  selector: 'xp-view-tours',
  templateUrl: './view-tours.component.html',
  styleUrls: ['./view-tours.component.css']
})
export class ViewToursComponent implements OnInit {
  tours: Tour[] = [];
  allTours: Tour[] = [];
  selectedTour: Tour;
  shoppingCartId: Number;
  shoppingCart: ShoppingCart;

  constructor(private service: TourAuthoringService, private authService: AuthService) {
    //this.shoppingCartId = 2;
  }

  async ngOnInit(): Promise<void> {
    await this.getTours();
        
      // Check if user details are available before loading the shopping cart
    if (this.authService.user$.value) {
      // Get the user ID
      const userId = this.authService.user$.value.id;

      // Set the shoppingCartId directly
      this.shoppingCartId = userId;
    }
  }


  async getTours(): Promise<void> {
    try {
      const result: PagedResults<Tour> | undefined = await this.service.getTours().toPromise();

      if (result) {
        this.allTours = result.results;
        this.tours = result.results;
      } else {
        // Handle the case where result is undefined
      }
    } catch (error) {
      // Handle errors if needed
    }
  }

  selectTour(tour: Tour): void {
    this.selectedTour = tour;
  }

  handleSearchResults(data: { tours: Tour[], searchActive: boolean }) {
    const searchActive = data.searchActive;
    
    if (searchActive) {
      // Display search results when search is active
      this.tours = data.tours;
    } else {
      // Display all tours when search is not active
      this.getTours(); // Refresh the tours to display all of them
    }
  
    // You can use this.tours in your component's template to display the updated results.
  }
  onAddClicked(tour: Tour): void {
    this.service.getShoppingCartById(this.shoppingCartId).subscribe({
      next: (result: ShoppingCart) => {
        this.shoppingCart = result;
        this.service.addToCart(this.shoppingCart, tour).subscribe({
          next: () => {

          },
          error: () => {
          }
          
        })
      }
    })
  }
  

  
}
