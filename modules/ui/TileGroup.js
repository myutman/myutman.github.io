const TileType = {
    UNKNOWN: "tile_unknown",
    OCCUPIED: "tile_occupied",
    FREE: "tile_free"
};

const tileTypes = [TileType.UNKNOWN, TileType.FREE, TileType.OCCUPIED];


class Tile extends Phaser.GameObjects.Container {
    constructor(config) {
        super(config.scene);
        this.config = config;
        this.db = config.db;
        this.spawn();
    }
    spawn() {
        this.x = this.config.x;
        this.y = this.config.y;
        this.i = this.config.i;
        this.j = this.config.j;
        this.size = this.config.size;
        this.numbered = false;
        this.type;

        this.image = this.scene.add.image(0, 0, TileType.UNKNOWN);
        this.image.setOrigin(0, 0);
        this.image.setScale(this.size / this.image.height);
        this.add(this.image);

        this.image.setInteractive();
        this.image.on('pointerdown', this.onPush, this);
        this.image.on('pointerup', this.onPull, this);
        this.image.on('pointerout', this.onOut, this);

        this.text = this.scene.add.text(0, 0, " ", {
            fontSize: 50,
            fill: "#ffffff",
            fontStyle: 'bold'
        });
        const textScale = 0.5 * this.size / this.text.height;
        this.text.setOrigin(0, 0);
        this.text.setScale(textScale);
        this.add(this.text);

        this.setType(this.config.type);

        this.scene.add.existing(this);
    }

    onPush() {
        console.log(`Numbered? ${this.numbered}`);
        if (!this.numbered) {
            let typeNumber = tileTypes.findIndex((val, _1, _2) => {
                console.log(`${this.type} =? ${val}`);
                return this.type === val;
            });
            console.log("Found ${typeNumber}");
            typeNumber = (typeNumber + 1) % 3;
            this.setType(tileTypes[typeNumber]);
            console.log(`Setting tile ${this.i}, ${this.j} type to ${this.type}`);
            this.db.newClickEvent(this.i, this.j);
        }
    }

    onPull() {
    }

    onOut() {
    }

    setText(text_str) {
        this.text.setText(text_str);

        this.text.x = 0.5 * (this.size - this.text.scale * this.text.width);
        this.text.y = 0.5 * (this.size - this.text.scale * this.text.height);
    }

    setType(type) {
        this.type = type;
        this.image.setTexture(this.type);
        if (this.type == TileType.UNKNOWN) {
            this.setText("?");
        } else {
            this.setText(" ");
        }
    }

    setNumbered() {
        this.numbered = true;
    }
}

export class TileGroup extends Phaser.GameObjects.Container {
    constructor(config) {
        super(config.scene);
        this.config = config;
        this.db = config.db;
        this.spawn();
    }

    async spawn() {
        this.N = this.config.N;
        this.height = this.config.height;
        this.width = this.config.width;
        this.offsetY = this.config.offsetY;
        // this.checkButtonHeight = this.config.checkButtonHeight;
        // this.checkButtonWidth = this.config.checkButtonWidth;
        this.tileSize = (this.height - 3 * this.offsetY) / this.N;
        this.size = this.tileSize * this.N;
        this.startX = 0.5 * this.width - 0.5 * this.size;
        this.startY = this.offsetY;

        this.tiles = new Array();
        this.field = this.db.field;
        this.field_color = this.db.field_color;

        this.drawField();
    }

    async checkSolvedLol() {
    }

    drawField() {


        for (let i = 0; i < this.N; i++) {
            this.tiles[i] = new Array();
            for (let j = 0; j < this.N; j++) {
                this.tiles[i][j] = new Tile({
                    scene: this.scene,
                    x: this.startX + this.tileSize * j,
                    y: this.startY + this.tileSize * i,
                    i: i,
                    j: j,
                    size: this.tileSize,
                    type: TileType.UNKNOWN,
                    db: this.db
                });
                this.add(this.tiles[i][j]);
            }
        }

        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.N; j++) {
                if (this.field[i][j] > 0) {
                    this.tiles[i][j].setType(TileType.FREE);
                    this.tiles[i][j].setText(String(this.field[i][j]));
                    this.tiles[i][j].setNumbered();
                } else {
                    this.tiles[i][j].setType(tileTypes[this.field_color[i][j]]);
                }
            }
        }

        this.scene.add.existing(this);
    }

    destroy(fromScene) {
        super.destroy(fromScene);
    }
}

