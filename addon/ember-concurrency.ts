import { task as _task, taskGroup as _taskGroup } from 'ember-concurrency';
import RSVP from 'rsvp';
import {
  UnwrapComputedPropertyGetter,
  UnwrapComputedPropertyGetters
} from '@ember/object/-private/types';

// Lifted from @types/ember__object/observable.d.ts
interface Getter {
  /**
   * Retrieves the value of a property from the object.
   */
  get<K extends keyof this>(key: K): UnwrapComputedPropertyGetter<this[K]>;
  /**
   * To get the values of multiple properties at once, call `getProperties`
   * with a list of strings or an array:
   */
  getProperties<K extends keyof this>(
    list: K[]
  ): Pick<UnwrapComputedPropertyGetters<this>, K>;
  getProperties<K extends keyof this>(
    ...list: K[]
  ): Pick<UnwrapComputedPropertyGetters<this>, K>;
}

export const task = _task as (fn: () => IterableIterator<any>) => TaskProperty;

export const taskGroup = _taskGroup as () => TaskGroupProperty;

interface CommonTaskProperty {
  restartable: () => TaskProperty;
  drop: () => TaskProperty;
  keepLatest: () => TaskProperty;
  enqueue: () => TaskProperty;
  maxConcurrency: (n: number) => TaskProperty;
  cancelOn: (eventName: string) => TaskProperty;
  group: (groupName: string) => TaskProperty;
}

export interface TaskProperty extends CommonTaskProperty {
  evented: () => TaskProperty;
  debug: () => TaskProperty;
  on: (eventName: string) => TaskProperty;
}

export interface TaskGroupProperty extends CommonTaskProperty {}

export type TaskOptions = {
  [option in keyof TaskProperty]?: Parameters<TaskProperty[option]> extends [
    infer P
  ]
    ? P
    : true
};
export type TaskGroupOptions = {
  [option in keyof TaskGroupProperty]?: Parameters<
    TaskGroupProperty[option]
  > extends [infer P]
    ? P
    : true
};

// Based on https://github.com/CenterForOpenScience/ember-osf-web/blob/7933316efae805e00723789809bdeb58a96a286a/types/ember-concurrency/index.d.ts

export enum TaskInstanceState {
  Dropped = 'dropped',
  Canceled = 'canceled',
  Finished = 'finished',
  Running = 'running',
  Waiting = 'waiting'
}

export interface TaskInstance<T> extends PromiseLike<T>, Getter {
  readonly error?: any;
  readonly hasStarted: boolean;
  readonly isCanceled: boolean;
  readonly isDropped: boolean;
  readonly isError: boolean;
  readonly isFinished: boolean;
  readonly isRunning: boolean;
  readonly isSuccessful: boolean;
  readonly state: TaskInstanceState;
  readonly value?: T;
  cancel(): void;
  catch(): RSVP.Promise<any>;
  finally(): RSVP.Promise<any>;
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | RSVP.Promise<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): RSVP.Promise<TResult1 | TResult2>;
}

export enum TaskState {
  Running = 'running',
  Queued = 'queued',
  Idle = 'idle'
}

export interface Task<Args extends any[], T> extends Getter {
  readonly isIdle: boolean;
  readonly isQueued: boolean;
  readonly isRunning: boolean;
  readonly last?: TaskInstance<T>;
  readonly lastCanceled?: TaskInstance<T>;
  readonly lastComplete?: TaskInstance<T>;
  readonly lastErrored?: TaskInstance<T>;
  readonly lastIncomplete?: TaskInstance<T>;
  readonly lastPerformed?: TaskInstance<T>;
  readonly lastRunning?: TaskInstance<T>;
  readonly lastSuccessful?: TaskInstance<T>;
  readonly performCount: number;
  readonly state: TaskState;
  perform(...args: Args): TaskInstance<T>;
  cancelAll(): void;
}