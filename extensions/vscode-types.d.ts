declare module 'vscode' {
    export const commands: any;
    export const window: any;
    export interface Disposable {
        dispose(): any;
    }
    export interface ExtensionContext {
        subscriptions: Disposable[];
        asAbsolutePath(relativePath: string): string;
        extensionPath: string;
    }
    export interface OutputChannel { }
}

interface Thenable<T> extends PromiseLike<T> { }
