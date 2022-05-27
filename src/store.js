import { writable } from 'svelte/store'

const defaultVideos = 
[
  {
    "title": "Lomachenko's jab",
    "position": "Standing",
    "url": "https://www.youtube.com/embed/k6s62WOT7XA",
    "notes": "this is an example standing video"
  },
  {
    "title": "Dan Henderson clinch",
    "position": "Clinch",
    "url": "https://www.youtube.com/embed/dzkGSxvvvaI",
    "notes": "this is an example clinch video" 
  },
  {
    "title": "Demian Maia guard study",
    "position": "Guard",
    "url": "https://www.youtube.com/embed/qu_ulU7nE-0",
    "notes": "this is an example guard video"
  },
  {
    "title": "Cage pin and control",
    "position": "Fence",
    "url": "https://www.youtube.com/embed/C-q6NYWPAVk",
    "notes": "this is an example fence video"
  },
  {
    "title": "Turtle escapes and concepts",
    "position": "Turtle",
    "url": "https://www.youtube.com/embed/DbSWNZwEFqo",
    "notes": "this is an example turtle video"
  }
]

export const currentPosition = writable("Home");
export const previousPosition = writable("Home");

export const videos = writable(JSON.parse(localStorage.getItem("videos")) || defaultVideos);
videos.subscribe(val => localStorage.setItem("videos", JSON.stringify(val)));