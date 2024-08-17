import { genField } from "/modules/network.js";

function getUTCDateMilliseconds() {
    let date = new Date();
    return date.toISOString();
}


const DATABASE_NAME = "MyDB"
const delay = ms => new Promise(res => setTimeout(res, ms));

export class DB {
    constructor(N) {
        this.N = N;
        this.field;
        this.events_loaded = false;
        this.field_set = false;
        this.events = new Array();
        this.state;
        this.dbConsistent = false;
        this.levelsStoreCreated = false;
        this.eventsStoreCreated = false;
        this.gameCreated = true;

        this.field_color = new Array();
        console.log(this.N);
        for (let i = 0; i < this.N; i++) {
            this.field_color.push(new Array());
            for (let j = 0; j < this.N; j++) {
                this.field_color[i].push(0);
            }
        }

        console.log(this.field_color);

        console.log("Inside DB constructor");

        this.setupDB();
    }

    async setupDB() {
        console.log("Setting up DB");
        const request = indexedDB.open(DATABASE_NAME, 3);
        request.onerror = (event) => {
            console.log(event.type)
        };
        request.onupgradeneeded = this.upgradeDB;
        request.onsuccess = () => {
            this.levelsStoreCreated = true;
            this.eventsStoreCreated = true;
            console.log("Database succesfully created");
        };

        while (!(this.levelsStoreCreated && this.eventsStoreCreated)){
            await delay(10);
        }
        this.dbConsistent = true;
    }

    async putStateToStorage(field) {
        await this.awaitConsistency();
        this.dbConsistent = false;
        var state = {
            field: field,
            date: getUTCDateMilliseconds()
        }
        const request = indexedDB.open(DATABASE_NAME, 3);
        request.onerror = (event) => {
            console.log(event.type)
        };
        request.onsuccess = (event) => {
            const db = event.target.result;
            const objectStore = db.transaction("levels", "readwrite").objectStore("levels");
            objectStore.add(state);
            this.dbConsistent = true;
        };
    }

    async putEventToStorage(state) {
        await this.awaitConsistency();
        this.dbConsistent = false;
        state.date = getUTCDateMilliseconds();
        const request = indexedDB.open(DATABASE_NAME, 3);
        request.onerror = (event) => {
            console.log(event.type)
        };
        request.onsuccess = (event) => {
            const db = event.target.result;
            const objectStore = db.transaction("events", "readwrite").objectStore("events");
            objectStore.add(state);
            this.dbConsistent = true;
        };
    }

    async newClickEvent(i, j) {
        this.field_color[i][j] += 1;
        this.field_color[i][j] %= 3;
        this.putEventToStorage({x: j, y: i});
    }

    async loadEvents(event) {
        console.log("Starting loading events");
        const cursor = event.target.result;
        if (cursor) {
            let click_event = cursor.value;
            if (click_event === undefined) {
                return;
            }
            console.log(click_event);
            this.events.push(click_event);

            cursor.continue();
            return;
        } else {
            console.log("Events loaded");
        }

        if (this.events.length > 0) {
            for (let i = 0; i < this.events.length; i++) {
                let click_event = this.events[i];
                this.field_color[click_event.y][click_event.x] += 1;
                this.field_color[click_event.y][click_event.x] %= 3;
            }
        }

        this.events_loaded = true;
        console.log(`Events loaded ${this.events_loaded}`);
        console.log("All events been handled");
    }

    async loadState(event) {
        console.log("Starting loading state");
        const cursor = event.target.result;
        if (cursor) {
            if (this.state === undefined) {
                this.state = cursor.value;
                console.log(this.state);
                cursor.continue();
            } else {
                return;
            }
        }
        if (this.state !== undefined) {
            this.field = this.state.field;
            console.log(this.field);
        }
        console.log("Field set");
        this.field_set = true;
    }


    async upgradeDB(event) {
        console.log("Upgrading DB");
        this.levelsStoreCreated = false;
        this.eventsStoreCreated = false;

        const db = event.target.result;

        var objectStore = db.createObjectStore("levels", { keyPath: "date" });
        objectStore.onerror = (event) => {
            console.log(event.type);
        }
        objectStore.onsuccess = (event) => {
            this.levelsStoreCreated = true;
        }

        var objectStore1 = db.createObjectStore("events", { keyPath: "date" });
        objectStore1.onerror = (event) => {
            console.log(event.type);
        }
        objectStore1.onsuccess = (event) => {
            this.eventsStoreCreated = true;
        }
    }


    async loadGame() {
        await this.awaitConsistency();
        this.dbConsistent = false;
        console.log("Loading game");
        const request = indexedDB.open(DATABASE_NAME, 3);
        request.onerror = (event) => {
            console.log(event.type);
        };
        request.onsuccess = (event) => {
            const db = event.target.result;
            
            console.log("Started reading levels");
            var levelStore = db.transaction("levels", "readwrite").objectStore("levels");
            const openCursor = levelStore.openCursor(null, "prev");
            openCursor.onerror = (event) => {
                console.log(event.type);
            }
            openCursor.onsuccess = (event) => {
                console.log("Successfully opened levels transaction");
                this.loadState(event);
            };

            console.log("Started reading events");
            var objectStore1 = db.transaction("events", "readwrite").objectStore("events");
            const openCursor1 = objectStore1.openCursor(null, "prev");
            openCursor1.onerror = (event) => {
                console.log(event.type);
            }
            openCursor1.onsuccess = (event) => {
                console.log("Successfully opened event transaction");
                this.loadEvents(event);
            };
        };

        console.log(`Field set ${this.field_set} & event loaded ${this.events_loaded}`);
        while (!this.field_set || !this.events_loaded) {
            await delay(10);
        }
        console.log(`Once again field set ${this.field_set} & event loaded ${this.events_loaded}`);

        console.log("Game loaded. Returning field and field color");
        console.log(this.field);
        console.log(this.field_color);

        this.dbConsistent = true;
        return {
            field: this.field,
            field_color: this.field_color
        }
    }


    async resetDB() {
        this.gameCreated = false;
        await this.awaitConsistency();
        console.log("Resetting DB");
        
        var startedCounter = 0;
        var stoppedCounter = 0;
        var onsuccess = () => {
            console.log("Deleting DB");
            stoppedCounter += 1;
            this.dbConsistent = false;
        };
        var onerror = () => {
            console.log("Couldn't delete database");
        };
        var onblocked = () => {
            console.log("Couldn't delete database due to the operation being blocked");
        };

        startedCounter += 1;
        var req = indexedDB.deleteDatabase(DATABASE_NAME);
        req.onsuccess = onsuccess;
        req.onerror = onerror;
        req.onblocked = onblocked;

        while (this.dbConsistent) {
            
            console.log("Waiting 200 ms");
            await delay(30);
        }

        while (startedCounter > stoppedCounter) {
            await delay(30);
        }

        console.log("Deleted database successfully");
        await this.setupDB();
        console.log("Created database successfully");
    }


    async newGame() {
        await this.resetDB();
        this.field = await genField(this.N);
        this.putStateToStorage(this.field);
        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.N; j++) {
                this.field_color[i][j] = 0;
            }
        }
        console.log("Game created");
        this.gameCreated = true;
        return {
            field: this.field,
            field_color: this.field_color
        }
    }


    async awaitConsistency() {
        while (!this.dbConsistent) {
            await delay(10);
        }
    }

    async awaitGameCreated() {
        while (!this.gameCreated) {
            await delay(10);
        }
    }
}