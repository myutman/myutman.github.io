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
        this.tileGroup = undefined;
    }

    create() {
        console.log('Game.create');

        var background = this.add.image(0, 0, 'background');
        background.setOrigin(0, 0);
        background.setScale(800 / background.width, 600 / background.height);

        this.tileGroup = new TileGroup({
            scene: this,
            N: 10,
            offsetY: 20,
            height: 600,
            width: 700,
            db: this.db
        });

        let button_height = 30;
        const checkButton = new ButtonComponent({
            scene: this,
            x: 800 - 85,
            y: 300,
            height: button_height,
            background: 'button',
            onPush: this.checkSolved.bind(this),
            label: "Solved?"
        });

        const undoButton = new ButtonComponent({
            scene: this,
            x: 800 - 85,
            y: 370,
            height: button_height,
            background: 'button',
            onPush: this.undo.bind(this),
            label: "Undo"
        })
    }

    checkSolved() {
        console.log(this.db.field);
        console.log(this.db.field_color);
        checkSolved(this.db.field, this.db.field_color)
            .then((isSolved) => {
                if (isSolved) {
                    this.scene.start('WinScene', { db: this.db });
                } else {
                    this.scene.start('LoseScene', { db: this.db });
                }
            })
    }

    async undo() {
        let event = await this.db.newUndoEvent();
        console.log(`Undo event: ${event}`);
        if (event !== undefined) {
            console.log(`Undo event: x=${event.x}, y = ${event.y}`);
            this.tileGroup.changeTile(event.x, event.y, "backward");
        }
    }
}
