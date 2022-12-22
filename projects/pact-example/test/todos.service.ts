import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface Todo {
  id: number;
  name: string;
  done: boolean;
  createdAt: Date;
}

export type CreateTodo = Pick<Todo, 'name' | 'done'>;

export const BASE_URL = new InjectionToken<string>('BASE_URL');

@Injectable({
  providedIn: 'root',
})
export class TodosService {
  constructor(
    private readonly httpClient: HttpClient,
    @Inject(BASE_URL) private readonly BASE_URL: string
  ) {}

  createTodo$(todo: CreateTodo): Observable<HttpResponse<Todo>> {
    return this.httpClient.post<Todo>(
      `${this.BASE_URL}/todo/rest/api/v1/todos`,
      todo,
      {
        observe: 'response',
      }
    );
  }
}
