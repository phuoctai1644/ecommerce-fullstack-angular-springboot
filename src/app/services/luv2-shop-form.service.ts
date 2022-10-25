import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Country } from '../common/country';
import { State } from '../common/state';

@Injectable({
  providedIn: 'root'
})
export class Luv2ShopFormService {

  private countriesUrl = `${environment.luv2shopApiUrl}/countries`
  private statesUrl = `${environment.luv2shopApiUrl}/states`

  constructor(private httpClient: HttpClient) { }

  getCreditCardMonths(startMonth: number): Observable<number[]> {
    let data: number[] = []

    for (let month = startMonth; month <= 12; month++) {
      data.push(month)
    }

    return of(data)
  }

  getCreditCardYears(): Observable<number[]> {
    let data: number[] = []

    // build an array for 'year' downlist list
    // Start at current year and loop for next 10 years
    const startYear: number = new Date().getFullYear()
    const endYear: number = startYear + 10

    for (let year = startYear; year <= endYear; year++) {
      data.push(year)
    }

    return of(data)

  }

  getCountries(): Observable<Country[]> {
    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(res => res._embedded.countries)
    )
  }

  getStates(countryCode: string): Observable<State[]> {
    // Search url
    const searchStateUrl = `${this.statesUrl}/search/findByCountryCode?code=${countryCode}`

    return this.httpClient.get<GetResponseStates>(searchStateUrl).pipe(
      map(res => res._embedded.states)
    )
  }
}

interface GetResponseCountries {
  _embedded: {
    countries: Country[]
  }
}

interface GetResponseStates {
  _embedded: {
    states: State[]
  }
}
