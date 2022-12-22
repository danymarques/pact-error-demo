import {
  HttpClientModule,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Matchers, Pact } from '@pact-foundation/pact';
import { pactWith } from 'jest-pact';
import { firstValueFrom, Observable } from 'rxjs';

import { BASE_URL, TodosService } from './todos.service';
@Injectable()
export class AcceptInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const clonedRequest = req.clone({
      setHeaders: {
        Accept: 'application/problem+json, application/json, text/plain, */*',
      },
    });

    return next.handle(clonedRequest);
  }
}

describe('pact example', () => {
  const DATE = '2022-02-15T06:13:55.205Z';
  const TODO_NAME = `My new todo`;

  pactWith(
    {
      consumer: 'my-consumer',
      provider: `my-provider`,
    },
    (provider: Pact) => {
      describe('Todos Service pact', () => {
        beforeEach(() => {
          TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [
              TodosService,
              {
                provide: BASE_URL,
                useValue: provider.mockService.baseUrl,
              },
              {
                provide: HTTP_INTERCEPTORS,
                useClass: AcceptInterceptor,
                multi: true,
              },
            ],
          });
        });

        let testee: TodosService;
        beforeEach(() => {
          testee = TestBed.inject(TodosService);
        });

        it('create a new todo', async () => {
          await provider.addInteraction({
            state: 'default',
            uponReceiving: 'create a new todo',
            withRequest: {
              method: 'POST',
              path: `/todo/rest/api/v1/todos`,
              body: {
                name: Matchers.string(TODO_NAME),
                done: Matchers.boolean(false),
              },
              headers: {
                Accept:
                  'application/problem+json, application/json, text/plain, */*',
              },
            },
            willRespondWith: {
              status: 201,
              headers: {
                'Content-Type': Matchers.term({
                  generate: 'application/json',
                  matcher: 'application/json.*',
                }),
              },
              body: {
                createdAt: Matchers.iso8601DateTimeWithMillis(DATE),
                id: Matchers.integer(4),
                name: Matchers.string(TODO_NAME),
                done: Matchers.boolean(false),
              },
            },
          });

          await firstValueFrom(
            testee.createTodo$({ name: TODO_NAME, done: false })
          );
        });
      });
    }
  );
});
