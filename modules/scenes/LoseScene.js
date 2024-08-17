import { ButtonComponent } from "/modules/ui/ButtonComponent.js";

export class LoseScene extends Phaser.Scene {
    constructor() {
        super('LoseScene');
        this.game_loaded;
        this.db;
    }

    init(data) {
        this.game_loaded = (data.db.field !== undefined);
        this.db = data.db;
    }

    create() {
        console.log('Title.create');

        var background = this.add.image(0, 0, 'background');
        background.setOrigin(0, 0);
        background.setScale(800 / background.width, 600 / background.height);

        const logo = this.add.text(400, -200, 'You Lose :(', {
            fontSize: 70,
            fill: "#74543e",
            fontStyle: 'bold'
        });
        logo.x -= 0.5 * logo.width;

        this.tweens.add({
            targets: logo,
            y: 200,
            ease: 'Bounce.out'
        });

        const button1 = new ButtonComponent({
            scene: this,
            x: 200, y: 400,
            height: 200, width: 200,
            offsetX: 10, offsetY: 10,
            centerShiftX: -5, centerShiftY: 5,
            background: 'button',
            onPush: this.startNewGame.bind(this),
            label: "Start New Game"
        });
        const button2 = new ButtonComponent({
            scene: this,
            x: 600, y: 400,
            height: 200, width: 200,
            offsetX: 10, offsetY: 10,
            centerShiftX: -5, centerShiftY: 5,
            background: 'button',
            onPush: this.loadGame.bind(this),
            label: "Continue"
        });
    }

    async startNewGame() {
        this.db.newGame();
        this.scene.start('WaitingCreationScene', { db: this.db });
    }

    async loadGame() {
        this.scene.start('GameScene', { db: this.db });
    }
}
