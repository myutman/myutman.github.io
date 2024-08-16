export class ButtonComponent extends Phaser.GameObjects.Container {
    constructor(config) {
        super(config.scene);
        this.config = config;
        this.spawnButton();
    }
    spawnButton() {

        this.x = this.config.x;
        this.y = this.config.y;
        this.offsetX = this.config.offsetX;
        this.centerShiftX = this.config.centerShiftX;
        this.centerShiftY = this.config.centerShiftY;
        this.width = this.config.width;
        this.height = this.config.height;
        this.label = this.config.label;

        this.background = this.scene.add.image(0, 0, this.config.background);
        console.log(`height=${this.height}, width=${this.width}`);
        console.log(`bg height=${this.background.height}, bg width=${this.background.width}`);
        console.log(`scale=${this.width / this.background.width}`);
        this.background.setScale(this.width / this.background.width, this.height / this.background.height);

        console.log(this.type);
        this.text = this.scene.add.text(0, 0, this.label, {
            fontSize: 50,
            fill: "#ffd76b",
            fontStyle: 'bold'
        });
        this.text.setOrigin(0.5, 0.5);

        this.text.setScale(0.125 * this.height / this.text.height);

        this.text.x += this.centerShiftX;
        this.text.y += this.centerShiftY;

        // 
        // this.text.x += this.text.scale * 0.5 * this.text.width;
        // this.text.setY(10 - 0.5 * this.text.height);
        this.background.setInteractive();

        this.background.on('pointerdown', this.onPush, this);
        this.background.on('pointerup', this.onPull, this);
        this.background.on('pointerout', this.onOut, this);

        this.add(this.background);
        this.add(this.text);
        this.scene.add.existing(this);
    }

    destroy(fromScene) {
        super.destroy(fromScene);
    }

    onPush() {
        this.tweenObject('push');
    }

    onPull() {
        if (typeof this.config.onPush === "function") {
            this.config.onPush();
        }
        this.tweenObject('pull');
    }

    onOut() {
        this.tweenObject('pull');
    }

    tweenObject(status) {
        if (status == "push") {
            this.text.setStyle({
                fontSize: 50,
                fill: "#f0f0f0",
                fontStyle: 'bold'
            });
            this.background.setTexture('button_pushed');
        } else {
            this.text.setStyle({
                fontSize: 50,
                fill: "#ffd76b",
                fontStyle: 'bold'
            });
            this.background.setTexture('button');
        }
    }
}
