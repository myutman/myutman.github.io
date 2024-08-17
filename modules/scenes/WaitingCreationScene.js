export class WaitingCreationScene extends Phaser.Scene {
    constructor() {
        super('WaitingCreationScene');
        this.db;
    }

    init(data) {
        this.db = data.db;
    }

    create() {
        console.log('WaitingCreationScene.create');

        var background = this.add.image(0, 0, 'background');
        background.setOrigin(0, 0);
        background.setScale(800 / background.width, 600 / background.height);

        const logo = this.add.text(400, 200, 'Creating Game', {
            fontSize: 70,
            fill: "#74543e",
            fontStyle: 'bold'
        });
        logo.x -= 0.5 * logo.width;

        this.db.awaitGameCreated().then(
            () => {
                this.scene.start('GameScene', { db: this.db });
            }
        )

    }
}
