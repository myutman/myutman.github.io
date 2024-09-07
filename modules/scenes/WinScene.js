import { ButtonComponent } from "/modules/ui/ButtonComponent.js";

export class WinScene extends Phaser.Scene {
    constructor() {
        super('WinScene');
        this.game_loaded;
        this.db;
    }

    init(data) {
        this.game_loaded = (data.db.field !== undefined);
        this.db = data.db;
    }

    create() {
        console.log('WinScene.create');

        var background = this.add.image(0, 0, 'background');
        background.setOrigin(0, 0);
        background.setScale(800 / background.width, 600 / background.height);

        const logo = this.add.text(400, -200, 'You Win!', {
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

        let button_height = 40;
        const button = new ButtonComponent({
            scene: this,
            x: 400, y: 400,
            height: button_height,
            background: 'button',
            onPush: this.startNewGame.bind(this),
            label: "New Game"
        });
    }

    async startNewGame() {
        this.db.newGame();
        this.scene.start('WaitingCreationScene', { db: this.db });
    }
}
