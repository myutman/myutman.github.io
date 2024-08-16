import { ButtonComponent } from "/modules/ui/ButtonComponent.js";
import { TileGroup } from "/modules/ui/TileGroup.js";
import { checkSolved } from "/modules/network.js";

export class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameScene'
        });
        this.db;
    }

    init(data) {
        this.db = data.db;
        console.log("In game init");
        console.log(this.db.field);
        console.log(this.db.field_color);
    }

    create() {
        console.log('Game.create');

        var background = this.add.image(0, 0, 'background');
        background.setOrigin(0, 0);
        background.setScale(800 / background.width, 600 / background.height);

        const tile_group = new TileGroup({
            scene: this,
            N: 10,
            offsetY: 20,
            height: 600,
            width: 700,
            db: this.db
        });

        const checkButton = new ButtonComponent({
            scene: this,
            x: 800 - 75,
            y: 300,
            height: 150, width: 150,
            offsetX: 10, offsetY: 10,
            centerShiftX: -1.25, centerShiftY: 1.25,
            background: 'button',
            onPush: this.checkSolved.bind(this),
            label: "Solved?"
        });
    }

    async checkSolved() {
        console.log(this.db.field);
        console.log(this.db.field_color);
        let isSolved = await checkSolved(this.db.field, this.db.field_color);
        console.log(`Solved = ${isSolved}`);
    }
}
