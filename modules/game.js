import { Boot } from "/modules/scenes/Boot.js";
import { Preloader } from "/modules/scenes/Preloader.js";
import { Title } from "/modules/scenes/Title.js";
import { GameScene } from "/modules/scenes/GameScene.js";
import { WinScene } from "/modules/scenes/WinScene.js";
import { LoseScene } from "/modules/scenes/LoseScene.js";
import { WaitingCreationScene } from "/modules/scenes/WaitingCreationScene.js";


const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    backgroundColor: '#2d2d6d',
    scene: [ Boot, Preloader, Title, GameScene, WinScene, LoseScene, WaitingCreationScene ]
};

const game = new Phaser.Game(config);
