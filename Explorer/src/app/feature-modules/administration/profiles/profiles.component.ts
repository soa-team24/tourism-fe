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
  suggestedProfiles: Profile[] = [];
  loggedInProfile: Profile | undefined; // Store the logged-in user's profile
  follows: Profile[] = [];
  followedProfiles: { [key: number]: boolean } = {};
  profileFollowed="";
  alreadyFollow: any;

  constructor(private service: AdministrationService) {}

  ngOnInit(): void {
    // Get the currently logged-in user's profile
    this.service.getByUserId().subscribe({
      next: (loggedInProfile: Profile) => {
        this.loggedInProfile = loggedInProfile;

        // Get all profiles and filter out the currently logged-in profile
        this.service.getProfiles().subscribe(
          (allProfiles: Profile[]) => {
            this.profiles = allProfiles.filter((profile: Profile) => profile.id !== this.loggedInProfile?.id);
          },
          (error: any) => {
            console.log(error);
          }
        );


        this.service.getSuggestedProfiles(this.loggedInProfile).subscribe(
          (allProfiles: Profile[]) => {
            this.suggestedProfiles = allProfiles.filter((profile: Profile) => profile.id !== this.loggedInProfile?.id);
          },
          (error: any) => {
            console.log(error);
          }
        );
        
        
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }
  
  


  onFollowClicked(profile: Profile) {
    if (this.loggedInProfile) {
      // Check if the logged-in profile already follows the selected profile
      this.service.alreadyFollows(profile.id!, this.loggedInProfile.id!).subscribe({
        next: (result: boolean) => {
          if (result) {
            // Display an alert if the combination already exists
            this.alreadyFollow = true;
            this.profileFollowed=`You already follow ${profile.firstName} ${profile.lastName}.`
            
            // alert(`You already follow ${profile.firstName} ${profile.lastName}`);
          } else {
            const follow: Follow = {
              profileId: profile.id!, // Id of the profile to be followed
              followerId: this.loggedInProfile!.id // Id of the logged-in user
            };
  
            this.service.addFollow(follow).subscribe({
              next: (newFollow: Follow) => {
                this.alreadyFollow=false;
                this.profileFollowed=`You have successfully followed ${profile.firstName} ${profile.lastName}`
                //alert(`You have successfully followed ${profile.firstName} ${profile.lastName}`);
                this.followedProfiles[profile.id!] = true;
              },
              error: (err: any) => {
                console.error('Error while following:', err);
              }
            });
          }
        },
        error: (err: any) => {
          console.error('Error while checking if already follows:', err);
        }
      });
    }
  }

  onFollowOKClicked() {
    this.profileFollowed=``
  }
}