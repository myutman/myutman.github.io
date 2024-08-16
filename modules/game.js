import { Boot } from "/modules/scenes/Boot.js";
import { Preloader } from "/modules/scenes/Preloader.js";
import { Title } from "/modules/scenes/Title.js";
import { GameScene } from "/modules/scenes/GameScene.js";


const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    backgroundColor: '#2d2d6d',
    scene: [ Boot, Preloader, Title, GameScene ]
};

const game = new Phaser.Game(config);
