export default class RandomPathFetcher {
    private paths: string[];

    constructor(paths: string[]) {
        if (paths.length === 0) {
            throw new Error("Path list cannot be empty.");
        }
        this.paths = paths;
    }

    /** Get a random path from the list */
    public next(): string {
        const randomIndex = Math.floor(Math.random() * this.paths.length);
        return this.paths[randomIndex];
    }
}