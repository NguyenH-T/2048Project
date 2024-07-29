import { HttpClient, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface Score {
    username: String,
    score: number,
    time: number
}

const APIURL : String = "http://localhost:8080"

@Injectable({
    providedIn: 'root'
})
export class DatabaseAPIService {
    
    constructor(private http: HttpClient) {

    }

    getAllScores(): Observable<Array<Score>> {
        return this.http.get<Score[]>(APIURL + '/scores')
    }

    getAllTimes(): Observable<Score[]> {
        return this.http.get<Score[]>(APIURL + '/scores?sortState=time')
    }

    saveScore(score: Score) : Observable<Object> {
        return this.http.post(APIURL + "/submitScore", score)
    }
}