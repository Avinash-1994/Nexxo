
import { ExplainEvent } from './types.js';

class ExplainReporter {
    private events: ExplainEvent[] = [];

    record(event: ExplainEvent) {
        this.events.push(event);
    }

    getEvents() {
        return this.events;
    }

    clear() {
        this.events = [];
    }

    // Helper for structured logging
    report(stage: string, decision: string, reason: string, data?: any) {
        this.record({ stage, decision, reason, data });
    }
}

export const explainReporter = new ExplainReporter();
