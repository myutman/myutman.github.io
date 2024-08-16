import { DB } from "/modules/db.js";

export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        this.load.image('background', 'assets/background/main.png');
        this.load.image('button', 'assets/buttons/button_released.png');
        this.load.image('button_pushed', 'assets/buttons/button_pressed.png');
        this.load.image('tile_unknown', 'assets/tiles/tile_unknown.png');
        this.load.image('tile_occupied', 'assets/tiles/tile_occupied.png');
        this.load.image('tile_free', 'assets/tiles/tile_free.png');

    }

    async create() {
        console.log('Preloader.create');
        var db = new DB(10);
        await db.loadGame();

        this.scene.start('Title', { db: db });
    }
}
