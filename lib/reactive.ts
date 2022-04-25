import { checkModified, Revisioned } from "./revisioned";
import {addMutableListener, isMutable, removeMutableListener} from "./mutable";


export type Next<T> = (t: T) => T
export type Setter<T> = (t: T | Next<T>) => T
export type Getter<T> = () => T
export type ValueOrGetter<T> = T | Getter<T>

export class Reactive {

    private recording = false;
    private inCreateReaction = false;
    private batchedReactionsToRun: boolean[] = [];
    private isAutoBatchScheduled = false;
    private reactionIndex = 0;
    private reactions: Array<() => void> = [];
    private dirty: Promise<void> = Promise.resolve();
    private dirtyResolve: () => void
    private timeout: any = undefined;
    private inBatchReactions: boolean;

    record<T>(func: (reactive: Reactive) => T): T {
        try {
            this.recording = true;
            return func(this);
        }
        finally {
            this.recording = false;
        }
    }

    createState<T>(value: ValueOrGetter<T>): [get: Getter<T>, set: Setter<T>] {
        let current: Revisioned<T>;
        let reactionsToRerun: boolean[] = [];

        const triggerReactions = () => {
            for (let index = 0; index < reactionsToRerun.length; index++) {
                if (reactionsToRerun[index]) {
                    if (this.recording)
                        this.reactions[index]();
                    else if (!this.inBatchReactions)
                        this.ScheduleAutoBatchRuns();
                    this.batchedReactionsToRun[index] = true;
                }
            }
        }

        let setter = (value: T | Next<T>) => {
            let isModified;
            if (current && isMutable(current.value))
                removeMutableListener(current.value, triggerReactions);
            [current, isModified] = checkModified((typeof value === 'function') ? (value as Next<T>)(current?.value) : value, current);
            if (isModified)
                triggerReactions();
            if (isMutable(current.value))
                addMutableListener(current.value, triggerReactions)
            return current.value;
        }

        let getter = () => {
            if (this.recording && this.inCreateReaction) {
                reactionsToRerun[this.reactionIndex] = true;
            }
            return current.value;
        }

        if (typeof value === 'function') {
            this.createReaction(() => {
                let newValue = (value as Getter<T>)();
                setter(newValue);
            })
        }
        else
            setter(value);

        return [getter, setter]
    }

    createReaction(func: () => void) {
        this.reactions[this.reactionIndex] = func;
        this.inCreateReaction = true;
        try {
            func();
        }
        finally {
            this.reactionIndex += 1;
            this.inCreateReaction = false;
        }
    }

    batchReactions<T>(func: () => T) {
        this.inBatchReactions = true;
        [this.dirty, this.dirtyResolve] = mkResolvablePromise()
        try {
            return func();
        }
        finally {
            this.flush()
            this.inBatchReactions = false;
            this.dirtyResolve();
        }
    }

    private ScheduleAutoBatchRuns() {
       if (!this.isAutoBatchScheduled) {
           this.isAutoBatchScheduled = true;
           [this.dirty, this.dirtyResolve] = mkResolvablePromise()
           this.timeout = setTimeout(() => {
               this.timeout = undefined;
               this.flush();
           }, 0)
       }
    }

    toBeClean(): Promise<void> {
        return this.dirty;
    }

    flush() {
        for (let index = 0; index < this.batchedReactionsToRun.length; index++)
            if (this.batchedReactionsToRun[index])
                this.reactions[index]();
        if (this.isAutoBatchScheduled) {
            this.isAutoBatchScheduled = false;
            if (this.timeout)
                clearTimeout(this.timeout);
            this.timeout = undefined;
        }
        this.batchedReactionsToRun = [];
        this.dirtyResolve()
    }
}

function mkResolvablePromise() {
    let resolve;
    let promise = new Promise((res) => resolve = res);
    return [promise, resolve];
}
