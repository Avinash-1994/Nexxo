
import { ExplainEvent } from './types.js';

class ExplainReporter {
    private events: ExplainEvent[] = [];

    record(event: ExplainEvent) {
        this.events.push({
            ...event,
            timestamp: event.timestamp || Date.now()
        });
    }

    getEvents() {
        return this.events;
    }

    clear() {
        this.events = [];
    }

    // Helper for structured logging
    report(stage: string, decision: string, reason: string, data?: any) {
        this.record({ stage, decision, reason, data, timestamp: Date.now() });
    }

    // Performance profiling
    private marks = new Map<string, number>();

    startMark(name: string) {
        this.marks.set(name, performance.now());
    }

    endMark(name: string, stage: string = 'profile') {
        const start = this.marks.get(name);
        if (start !== undefined) {
            const duration = performance.now() - start;
            this.report(stage, 'performance', `${name} took ${duration.toFixed(2)}ms`, { duration });
            this.marks.delete(name);
        }
    }
}

export const explainReporter = new ExplainReporter();
