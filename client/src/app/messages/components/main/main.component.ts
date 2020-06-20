import { Component, OnInit, DoCheck } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  title: string;

  constructor() {
    this.title = 'Mensajes privados'
   }

  ngOnInit(): void {
  }

}
