import { Component, OnInit } from '@angular/core';
import { TourExecutionService } from '../tour-execution.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { TourExecution } from '../model/tourexecution.model';
import { TouristPosition } from '../model/touristposition.model';
import { TourAuthoringService } from '../../tour-authoring/tour-authoring.service';
import { Tour } from '../../tour-authoring/model/tour.model';
import { Checkpoint } from '../../tour-authoring/model/checkpoint.model';
import * as L from 'leaflet';
import { Marker } from 'leaflet';
import { Observable } from 'rxjs';
import { zip } from "rxjs";
import { Router } from '@angular/router';

@Component({
  selector: 'xp-active-tour',
  templateUrl: './active-tour.component.html',
  styleUrls: ['./active-tour.component.css']
})
export class ActiveTourComponent implements OnInit  {

  public touristPosition:TouristPosition = {longitude:0,latitude:0};
  public tour:Tour;
  public tourExecution:TourExecution;
  public checkpointList:Checkpoint[] = [];
  public markerList:Marker[]=[];
  public markersReady:Promise<boolean>;
  public userIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3710/3710297.png',
    shadowUrl: '',

    iconSize:     [40, 45], // size of the icon
    iconAnchor:   [40, 45], // point of the icon which will correspond to marker's location
});

  constructor(private router:Router,private tourExecutionService:TourExecutionService,private tourAuthoringService:TourAuthoringService, private authService: AuthService){}

  ngOnInit() {
    let id = this.authService.user$.value.id;
    let touristPositionRaw = localStorage.getItem(id.toString()) || '';
    this.touristPosition = JSON.parse(touristPositionRaw);
    this.tourExecutionService.getTourExecution(id).subscribe((tourExecution:TourExecution)=>{
      this.tourExecution = tourExecution
      this.tourAuthoringService.getTour(tourExecution.tourId).subscribe((tour:Tour)=>{
        this.tour = tour;
        this.getCheckpoints();
      })
    })
  }

  getCheckpoints(){
    let allPromises:Observable<any>[] = [];
    for (let i = 0; i < this.tour.checkPoints.length; i++) {
      const cpId = this.tour.checkPoints[i];
      let promise = this.tourAuthoringService.getCheckpointById(cpId)
      allPromises.push(promise);
    }
    let list = zip([...allPromises]);
    list.subscribe({next:(value)=>{
      this.checkpointList = value;
    },complete:()=>{
      this.getMarkerList()
    }})
  }

  getMarkerList(){
    for (let i = 0; i < this.checkpointList.length; i++) {
      const cp = this.checkpointList[i];
      let newMarker = new L.Marker([cp.latitude,cp.longitude])
      this.markerList.push(newMarker)
    }
    let userMarker = new L.Marker([this.touristPosition.latitude,this.touristPosition.longitude],{icon:this.userIcon})
    this.markerList.push(userMarker)
    this.markersReady = Promise.resolve(true);
  }

  updateTourExec(value:string){
    if (value == 'complete') {
      this.tourExecutionService.completeTour(this.tourExecution.id).subscribe({next:(value)=>{
        this.router.navigate(['view-tours'])
      }})
    }
    else {
      this.tourExecutionService.abandonTour(this.tourExecution.id).subscribe({next:(value)=>{
        this.router.navigate(['view-tours'])
      }})
    }
  }
}
