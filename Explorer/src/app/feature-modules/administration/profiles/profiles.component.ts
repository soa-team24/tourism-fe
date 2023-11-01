import { Component, OnInit } from '@angular/core';
import { Profile } from '../model/profile.model';
import { AdministrationService } from '../administration.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Follow } from '../model/follow.model';

@Component({
  selector: 'xp-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css']
})
export class ProfilesComponent implements OnInit {
  profiles: Profile[] = [];
  loggedInProfile: Profile | null = null; // Store the logged-in user's profile
  follows: Follow[] = [];
  followedProfiles: { [key: number]: boolean } = {};

  constructor(private service: AdministrationService) {}

  ngOnInit(): void {
    // Get the currently logged-in user's profile
    this.service.getByUserId().subscribe({
      next: (loggedInProfile: Profile) => {
        this.loggedInProfile = loggedInProfile;

        // Get all profiles
        this.service.getProfiles().subscribe({
          next: (result: PagedResults<Profile>) => {
            // Filter out the currently logged-in profile
            this.profiles = result.results.filter((profile) => profile.id !== loggedInProfile.id);
          },
          error: (err: any) => {
            console.log(err);
          }
        });

        // Get follows after getting the logged-in user's profile
      this.service.getFollows().subscribe({
        next: (result: PagedResults<Follow>) => {
          this.follows = result.results;
        },
        error: (err: any) => {
          console.error('Error while getting follows:', err);
        }
      });
      },
      error: (err: any) => {
        console.log(err);
      }
    });

    
  }


onFollowClicked(profile: Profile) {
  if (this.loggedInProfile) {
    // Check if the combination of person's id and logged-in user's id exists in the follows array
    const alreadyFollows = this.follows.some(follow => 
      follow.profileId === profile.id && follow.followerId === this.loggedInProfile!.id
    );

    if (alreadyFollows) {
      // Display an alert if the combination already exists
      alert(`You already follow ${profile.firstName} ${profile.lastName}`);
    } else {
      const follow: Follow = {
        id: 0, // The id can be 0 or null if your server generates it
        profileId: profile.id, // Id of the profile to be followed
        followerId: this.loggedInProfile!.id // Id of the logged-in user
      };

      this.service.addFollow(follow).subscribe({
        next: (newFollow: Follow) => {
          alert(`You have successfully followed ${profile.firstName} ${profile.lastName}`);
          this.followedProfiles[profile.id!] = true;
        },
        error: (err: any) => {
          console.error('Error while following:', err);
        }
      });
    }
  }
}

}