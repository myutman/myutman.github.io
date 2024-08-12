import { genField } from "./network.js"
import { DB } from "/modules/db.js"

const ButtonType = {
    CONTINUE: "continue",
    NEW_GAME: "new_game"
};

class ButtonComponent extends Phaser.GameObjects.Container {
    constructor(config) {
        super(config.scene);
        this.config = config;
        this.spawnButton();
    }
    spawnButton(){

        this.x = this.config.x;
        this.y = this.config.y;
        this.type = this.config.buttonType;

        this.background = this.scene.add.image(0, 0, this.config.background);
        this.background.setOrigin(0, 0);
        this.background.setScale(0.7);
        this.firstScale = this.background.scale;
        this.background.setX(- this.firstScale * 0.5 * this.background.width);
        this.background.setY(- this.firstScale * 0.5 * this.background.height);

        this.background.setInteractive();

        this.background.on('pointerdown',this.onPush, this);
        this.background.on('pointerup', this.onPull, this);
        this.background.on('pointerout', this.onOut, this);

        let button_text;
        console.log(this.type);
        if (this.type == ButtonType.CONTINUE) {
            button_text = "Continue";
        } else {
            button_text = "New Game";
        }
        this.text = this.scene.add.text(0, 0, button_text, {
            fontSize: 50,
            fill: "#ffd76b",
            fontStyle: 'bold'
        });
        this.text.setOrigin(0, 0);
        this.text.setX(- 10 - 0.5 * this.text.width);
        this.text.setY(10 - 0.5 * this.text.height);

        this.add(this.background);
        this.add(this.text);
        this.scene.add.existing(this);
    }

    destroy(fromScene){
        super.destroy(fromScene);
    }

    onPush(){
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
            })
            this.background.setTexture('button_pushed');
        } else {
            this.text.setStyle({
                fontSize: 50,
                fill: "#ffd76b",
                fontStyle: 'bold'
            })
            this.background.setTexture('button');
        }
    }
}

class Boot extends Phaser.Scene
{
    constructor ()
    {
        super('Boot');
    }

    create ()
    {
        console.log('Boot.create');

        this.scene.start('Preloader');
    }
}

class Preloader extends Phaser.Scene
{
    constructor ()
    {
        super('Preloader');
    }

    preload ()
    {
        this.load.image('background', 'assets/background/main.png');
        this.load.image('button', 'assets/buttons/button_released.png');
        this.load.image('button_pushed', 'assets/buttons/button_pressed.png');
        this.load.image('tile_unknown', 'assets/tiles/tile_unknown.png');
        this.load.image('tile_occupied', 'assets/tiles/tile_occupied.png');
        this.load.image('tile_free', 'assets/tiles/tile_free.png');
        
    }

    async create ()
    {
        console.log('Preloader.create');
        var db = new DB(10);
        await db.loadGame();

        this.scene.start('Title', { db: db });
    }
}

class Title extends Phaser.Scene
{
    constructor ()
    {
        super('Title');
        this.game_loaded;
        this.db;
    }

    init(data) {
        this.game_loaded = (data.db.field !== undefined);
        this.db = data.db;
    }

    create ()
    {
        console.log('Title.create');

        var background = this.add.image(0, 0, 'background');
        background.setOrigin(0, 0);
        background.setScale(800 / background.width, 600 / background.height);
        
        const logo = this.add.text(400, -200, 'Cave Puzzle', {
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

        if (!this.game_loaded) {
            const button = new ButtonComponent({
                scene: this,
                x:400, y:400,
                background: 'button',
                onPush:this.startNewGame.bind(this),
                buttonType: ButtonType.NEW_GAME
            });
        } else {
            const button1 = new ButtonComponent({
                scene: this,
                x:200, y:400,
                background: 'button',
                onPush:this.startNewGame.bind(this),
                buttonType: ButtonType.NEW_GAME
            });
            const button2 = new ButtonComponent({
                scene: this,
                x:600, y:400,
                background: 'button',
                onPush:this.loadGame.bind(this),
                buttonType: ButtonType.CONTINUE
            });
        }
    }

    async startNewGame() {
        await this.db.newGame();
        this.scene.start('GameScene', {db: this.db});
    }

    async loadGame() {
        this.scene.start('GameScene', {db: this.db});
    }
}


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
        this.image.on('pointerdown',this.onPush, this);
        this.image.on('pointerup', this.onPull, this);
        this.image.on('pointerout', this.onOut, this);

        this.text = this.scene.add.text(0, 0, " ",{
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
        console.log(`Numbered? ${this.numbered}`)
        if (!this.numbered) {
            let typeNumber = tileTypes.findIndex((val, _1, _2) => { 
                console.log(`${this.type} =? ${val}`);
                return this.type === val;
            });
            console.log("Found ${typeNumber}")
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


class TileGroup extends Phaser.GameObjects.Container {
    constructor(config) {
        super(config.scene);
        this.config = config;
        this.db = config.db;
        this.spawn()
    }

    async spawn() {
        this.N = this.config.N;
        this.height = this.config.height;
        this.width = this.config.width;
        this.offsetY = this.config.offsetY;
        this.tileSize = (this.height - 2 * this.offsetY) / this.N;
        this.size = this.tileSize * this.N;
        this.startX = 0.5 * this.width - 0.5 * this.size;
        this.startY = 0.5 * this.height - 0.5 * this.size;

        this.tiles = new Array();
        this.field = this.db.field;
        this.field_color = this.db.field_color;

        this.drawField();
    }

    async drawField() {

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
                })
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

    destroy(fromScene){
        super.destroy(fromScene);
    }
}

class GameScene extends Phaser.Scene
{
    constructor ()
    {
        super({
            key: 'GameScene'
        });
        this.db;
    }

    init (data) {
        this.db = data.db;
        console.log("In game init");
        console.log(this.db.field);
        console.log(this.db.field_color);
    }

    create ()
    {
        console.log('Game.create');

        var background = this.add.image(0, 0, 'background');
        background.setOrigin(0, 0);
        background.setScale(800 / background.width, 600 / background.height);

        new TileGroup({
            scene: this,
            N: 10,
            offsetY: 20,
            height: 600,
            width: 800,
            db: this.db
        })

    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    backgroundColor: '#2d2d6d',
    scene: [ Boot, Preloader, Title, GameScene ]
};

const game = new Phaser.Game(config);
