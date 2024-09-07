const ASSET_SIZE = 60
const CLICKABLE_HEIGHT = 12
const CLICKABLE_WIDTH = 40
const BORDER_SIZE_Y = 4
const BORDER_SIZE_X = 3
const SHADE_SIZE = 4

export class ButtonComponent extends Phaser.GameObjects.Container {
    constructor(config) {
        super(config.scene);
        this.config = config;
        this.spawnButton();
    }
    spawnButton() {

        this.x = this.config.x;
        this.y = this.config.y;
        this.height = this.config.height;
        this.label = this.config.label;

        this.background = this.scene.add.image(0, 0, this.config.background);
        console.log(`height=${this.height}, width=${this.width}`);
        console.log(`bg height=${this.background.height}, bg width=${this.background.width}`);
        console.log(`scale=${this.width / this.background.width}`);

        this.clickArea = this.scene.add.rectangle(0, 0, this.height, this.height, "#ff0000");
        // this.clickArea.setX(this.clickArea.x - (0.5 * BORDER_SIZE / ASSET_SIZE) * this.height)
        // this.clickArea.setY(this.clickArea.y + (0.5 * BORDER_SIZE / ASSET_SIZE) * this.height)

        // this.clickArea = new Rectangle(this.scene, 0, 0, this.width, this.height / 4, "#ff0000")

        console.log(this.type);
        this.text = this.scene.add.text(0, 0, this.label, {
            fontSize: 50,
            fill: "#ffd76b",
            fontStyle: 'bold',
            align: 'center'
        });
        this.text.setOrigin(0.5, 0.5);

        let textVerticalSpace = 0.7

        this.horizontalScale = ((CLICKABLE_WIDTH + 4) / CLICKABLE_WIDTH) * (this.text.width / this.text.height) * textVerticalSpace;
        
        this.text.setScale(textVerticalSpace * this.height / this.text.height);
        this.background.setScale(this.horizontalScale * (ASSET_SIZE / CLICKABLE_WIDTH) * this.height / this.background.width, (ASSET_SIZE / CLICKABLE_HEIGHT) * this.height / this.background.height);
        this.clickArea.setScale(this.horizontalScale, 1);



        let offsetX = (this.height * this.horizontalScale) * (0.5 * SHADE_SIZE / CLICKABLE_WIDTH);
        let offsetY = this.height * (0.5 * SHADE_SIZE / CLICKABLE_HEIGHT);

        this.text.x -= offsetX;
        this.text.y += offsetY;

        this.clickArea.x -= offsetX;
        this.clickArea.y += offsetY;


        this.clickArea.setInteractive();

        this.clickArea.on('pointerdown', this.onPush, this);
        this.clickArea.on('pointerup', this.onPull, this);
        this.clickArea.on('pointerout', this.onOut, this);

        this.add(this.clickArea);
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
